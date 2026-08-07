"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

/**
 * The header's two scroll-driven behaviours.
 *
 * **It gets out of the way going down the page and comes back going up.** The
 * details are what separate this from the version that feels broken:
 *
 * - **Direction is measured against a threshold, and the threshold
 *   accumulates.** A trackpad emits a stream of one- and two-pixel deltas, and
 *   reacting to each one makes the header flutter. Movement below
 *   `DIRECTION_DELTA` is not ignored, it is banked, so a slow deliberate
 *   scroll flips the state at the same total distance as a fast one.
 * - **Reduced motion opts out in CSS, not here.** The stylesheet only applies
 *   the hidden transform under `prefers-reduced-motion: no-preference`, so
 *   those visitors get a header that stays put rather than teleporting. This
 *   hook sets the attribute either way, because a component that branches on
 *   motion preference itself is the bug that silently disabled this whole
 *   behaviour once already.
 *
 * **It wears the cover's colours for exactly as long as the cover is behind
 * it.** On a page whose first section is forest, a cream bar sitting on top of
 * it looks stuck on; the header is transparent instead and its contents turn
 * cream, and it goes solid at the moment the cover's bottom edge passes under
 * it — not a pixel before.
 *
 * ## Why it is measured rather than timed (owner report, 2026-08-08)
 *
 * It used to go solid 240px into the page, whatever the page was. That number
 * came from a 2026-08-04 decision to release the cover on any scroll rather
 * than track it, and it was wrong in proportion to how tall the cover is:
 *
 * | route | cover | cream bar begins |
 * |---|---|---|
 * | `/operators` | 744px | 240px — with **504px of forest still to go** |
 * | `/about` | 592px | 240px |
 * | `/explore`, `/contact` | 518px | 240px |
 *
 * So every cover route put a cream bar on a green field partway down, and
 * `/operators` — the tallest cover on the site — wore it for two thirds of the
 * cover. Reported as a bug on `/operators` specifically; it was on all of them,
 * and it is the same defect the transparency exists to prevent.
 *
 * The cover's own bottom edge answers the question exactly, at every height, on
 * every route, with no constant to keep in sync with a design that moves.
 *
 * The comparison is against the header's **resting** height (`offsetHeight`,
 * which no transform touches) rather than its animated position. That is what
 * stops the colour flickering as the bar slides back into view: a hidden bar
 * sitting at `bottom: 0` would otherwise report itself clear of a cover it is
 * about to be drawn on top of again.
 *
 * It also retires a latch and a reduced-motion backstop that both existed to
 * paper over the timed rule — the swap now happens at a boundary that is
 * genuinely there, so there is nothing to hide from the visitor and no case
 * where a transparent bar can end up over cream content.
 *
 * `hidden` is written straight to the DOM so scrolling never re-renders React.
 * `overCover` is state because the tone genuinely changes the tree — but it
 * flips only when the cover's edge crosses the bar, not per scroll event.
 */

/** Never hide within this many pixels of the top. */
const REVEAL_ABOVE = 8;

/** Total movement in one direction before the header changes its mind. */
const DIRECTION_DELTA = 8;

/**
 * Routes whose first section is a dark cover, for the first paint only.
 *
 * The effect below re-derives this from the DOM, which is the authority. This
 * list exists so the server and the first client paint agree: a page that
 * rendered a cream bar and flipped to transparent after hydration would flash
 * on every load. Add a route here in the same change that gives it a
 * `data-dark-hero` section.
 */
const COVER_ROUTES = new Set([
  "/",
  "/explore",
  "/operators",
  "/about",
  "/contact",
]);

function isCoverRoute(pathname: string): boolean {
  return COVER_ROUTES.has(pathname) || pathname.startsWith("/go/");
}

export function useHeaderChrome() {
  const ref = React.useRef<HTMLElement>(null);
  const pathname = usePathname();

  /*
    Seeded from the route so the server and the first client paint agree. A
    homepage that rendered a cream bar and then flipped to transparent after
    hydration would flash on every load. The effect immediately refines this
    from the DOM, which is the authority: a page either contains a dark cover
    or it does not.
  */
  const [overCover, setOverCover] = React.useState(() =>
    isCoverRoute(pathname),
  );

  React.useEffect(() => {
    const header = ref.current;
    if (!header) return;

    /**
     * The page's cover element — or `null` when this route has none, and also
     * while the route's own markup is not on the page yet.
     *
     * **Those last two are different states, and the difference matters.** A
     * client-side navigation to a route that suspends renders `loading.tsx`
     * first, and this effect runs against *that*: `pathname` has already
     * changed, so the DOM is asked the question while the answer on screen is
     * a cream loading screen. Reading "no cover" there is correct for the
     * fallback and wrong for the page arriving behind it — and nothing re-runs,
     * because the pathname does not change a second time.
     *
     * So the unknown state is detected (`<main>` is the signal: every route
     * renders exactly one and the fallback renders none) and settled by the
     * observer at the bottom of this effect, rather than being guessed at.
     */
    /*
      Only elements that have layout count.

      React streams a suspended segment by appending it to the end of `<body>`
      inside a `display: none` container and then swapping it in. While that
      copy is parked there, `querySelector` can hand back the staged `<main>`
      and the staged cover — elements whose every measurement is zero. Trusting
      one would read a 744px cover as 0px tall and paint the solid bar over it.

      Under `next dev` the container is not even removed afterwards, so the
      document keeps two of each indefinitely (see `e2e/support/ready.ts`,
      where the same trap is documented and measured). A production build
      leaves one. Measuring rather than counting is correct for both.
    */
    function hasLayout(element: Element): boolean {
      return element.getBoundingClientRect().height > 0;
    }

    function readCover(): { element: Element | null } | null {
      const candidates = [...document.querySelectorAll("[data-dark-hero]")];
      const laidOut = candidates.find(hasLayout);
      if (laidOut) return { element: laidOut };

      /*
        Present but not yet measurable: the route is mid-arrival, and the only
        copy in the document is React's staged one. That is *unknown*, not "no
        cover" — recording the latter here would answer the question wrongly
        and, worse, settle it: the observer below is only armed while the
        answer is unknown, so a page with a cover would wear the solid bar for
        the rest of the visit.
      */
      if (candidates.length > 0) return null;

      /*
        Nothing at all. Either this route genuinely has no cover, or its markup
        has not arrived. `<main>` tells them apart: every route renders exactly
        one and `loading.tsx` renders none.
      */
      const shell = [...document.querySelectorAll("main")].some(hasLayout);
      return shell ? { element: null } : null;
    }

    /*
      `null` while the answer is unknown, which paints the solid bar — the
      right way round, because the fallback is a cream screen and a transparent
      bar over it renders cream type on cream.
    */
    let coverElement = readCover()?.element ?? null;

    // Reveal on focus whatever the preference: a focus ring parked off-screen
    // is a defect (WCAG 2.4.11), not a motion choice. Closing the menu returns
    // focus to the trigger, which lives in here.
    const reveal = () => {
      header.dataset.hidden = "false";
    };
    header.addEventListener("focusin", reveal);

    /** Is the cover still drawn behind the bar's resting position? */
    function isOverCover(): boolean {
      if (!header) return false;
      /*
        Re-resolve a node React has replaced. The element is cached because
        this runs on every scroll frame, and a cached node that has been
        swapped out measures zero from wherever it now lives — which would read
        as "the cover has scrolled past" while it is sitting on screen.
      */
      if (coverElement && !coverElement.isConnected) {
        coverElement = readCover()?.element ?? null;
      }
      if (!coverElement) return false;
      /*
        `offsetHeight`, not the animated rect: the bar's resting bottom edge.
        A hidden bar sits at `bottom: 0` and would otherwise report itself
        clear of a cover it is about to be drawn on top of again, so the
        colour would flicker through every slide back into view.
      */
      return coverElement.getBoundingClientRect().bottom > header.offsetHeight;
    }

    let anchorY = window.scrollY;
    let hidden = false;
    let cover = isOverCover();
    let frame = 0;

    setOverCover(cover);

    function update() {
      frame = 0;
      if (!header) return;

      // Clamp: rubber-band overscroll reports positions outside the document,
      // and a negative delta there would read as "scrolling up".
      const y = Math.max(0, window.scrollY);

      /*
        The colour is a measurement, not a latch (owner report, 2026-08-08).

        It used to be held until the header had physically left the screen,
        with a 240px backstop for the visitors whose header never leaves —
        machinery that existed because the release point was a guess and the
        guess had to be hidden. The cover's own bottom edge is not a guess, so
        the swap can simply happen where it belongs, and the case that machinery
        was protecting against (a cream bar seen sliding away over forest) does
        not arise: inside the cover the bar is transparent, whether it is
        sliding or sitting still.
      */
      const nextCover = isOverCover();
      if (nextCover !== cover) {
        cover = nextCover;
        setOverCover(nextCover);
      }

      if (y <= REVEAL_ABOVE) {
        anchorY = y;
        if (hidden) {
          hidden = false;
          header.dataset.hidden = "false";
        }
        return;
      }

      const delta = y - anchorY;
      // Below the threshold the movement is banked rather than discarded, so
      // `anchorY` deliberately does not move here.
      if (Math.abs(delta) < DIRECTION_DELTA) return;

      const next = delta > 0;
      anchorY = y;
      if (next !== hidden) {
        hidden = next;
        header.dataset.hidden = next ? "true" : "false";
      }
    }

    function schedule() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", schedule, { passive: true });

    /*
      Ask again when the route's markup actually commits.

      Only when the first answer was unknown, and only until it is known: the
      observer disconnects on the first real answer, so this costs nothing on
      a page that was already there — which is every hard load, and every
      navigation to a static route.

      `childList` on the whole body rather than a narrower target, because
      what arrives is a whole route segment replacing the fallback, and React
      also stages streamed segments at the end of `<body>` before swapping
      them in. A subtree observer is the only one that sees both.
    */
    let observer: MutationObserver | null = null;
    if (readCover() === null) {
      observer = new MutationObserver(() => {
        const settled = readCover();
        if (settled === null) return;
        observer?.disconnect();
        observer = null;
        coverElement = settled.element;
        update();
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      window.removeEventListener("scroll", schedule);
      header.removeEventListener("focusin", reveal);
      observer?.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
    // Re-runs on navigation: a new page has a new cover, or none, and starts
    // at the top with a fresh anchor.
  }, [pathname]);

  return { ref, overCover };
}
