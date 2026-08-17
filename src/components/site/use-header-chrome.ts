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
 * **It wears the cover's colours only where nothing can come between them and
 * the cover: at the very top of the page, and while the bar itself cannot be
 * seen.** Any bar the visitor can actually see below the top is solid cream —
 * owner direction, 2026-08-16, from on-device iOS captures: a bar that came
 * back transparent partway down the cover sat under the Dynamic Island with
 * the cover's own type sliding through the lockup. "Going back to the top we
 * should see the header with cream background till we reach the top point."
 *
 * That narrows the 2026-08-08 rule — the cover's colours for exactly as long
 * as the cover is behind the bar — to the states where it still holds:
 *
 * - **At the top**, the resting bar over the cover: the whole point of the
 *   transparency, unchanged.
 * - **While hidden over the cover**, so the slide-away that begins at the top
 *   leaves in the colours it arrived with instead of flashing cream on its
 *   way out — and, for reduced-motion visitors, whose bar never actually
 *   leaves, so the ride DOWN a cover never puts a cream bar on a green field
 *   (the 2026-08-08 defect). The moment such a bar is asked back below the
 *   top it returns solid, and the swap lands in the same frame the reveal
 *   begins — while the bar is still off-screen — so no repaint is ever seen.
 *
 * The cover's bottom edge is still measured, never timed (2026-08-08): a bar
 * hidden below the cover must already be cream when it is next revealed. The
 * comparison is against the bar's **resting** height (`offsetHeight`, which
 * no transform touches) rather than its animated position, so the answer
 * cannot flicker mid-slide.
 *
 * `hidden` is written straight to the DOM so scrolling never re-renders React.
 * `overCover` is state because the tone genuinely changes the tree — but it
 * flips at boundaries (the top edge, the cover's edge, a reveal), not per
 * scroll event.
 */

/** Never hide within this many pixels of the top, and reveal arriving here. */
const REVEAL_ABOVE = 8;

/** Total movement in one direction before the header changes its mind. */
const DIRECTION_DELTA = 8;

/**
 * How far down the cover's colours reach for a bar that is still visible.
 *
 * Descending from the top, the hide cannot fire until `DIRECTION_DELTA` has
 * accumulated past the reveal zone — so between `REVEAL_ABOVE` and this line
 * there is a visible bar that is *about* to hide. Releasing the cover's
 * colours at `REVEAL_ABOVE` painted that bar cream for those few pixels, and
 * a cream bar seen sliding away over forest is the original glitch this
 * machinery exists to prevent (owner report, 2026-08-04). The zone ends
 * exactly where the hide is guaranteed to have fired, because the anchor can
 * never sit deeper than `REVEAL_ABOVE` while the page is at the top.
 *
 * Ascending, the same line simply starts the deliberate cross-fade a few
 * pixels early, which reads identically to starting it at `REVEAL_ABOVE`.
 */
const COVER_ABOVE = REVEAL_ABOVE + DIRECTION_DELTA;

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
    /*
      Read from the DOM, not assumed. This component lives in the layout, so a
      navigation re-runs this effect without remounting the element, and a bar
      hidden on the previous page (say, by the scroll down to the footer link
      that navigated) is still hidden here. Seeding `false` desynced the two:
      the guard below saw nothing to change, the attribute stayed "true", and
      the new page opened with no header until the visitor scrolled down and
      back up again.
    */
    let hidden = header.dataset.hidden === "true";
    let cover = false;
    let frame = 0;

    const setHidden = (next: boolean) => {
      if (next === hidden) return;
      hidden = next;
      header.dataset.hidden = next ? "true" : "false";
    };

    /*
      The tone, from the states already resolved this frame. The cover's
      colours belong to the resting bar at the top and to the hidden bar still
      over the cover — never to a bar the visitor can see anywhere else (owner
      direction, 2026-08-16). Always called AFTER `hidden` is settled for the
      frame: a reveal and its repaint to cream must land together, or the bar
      slides in wearing the state it was hidden with — which is exactly the
      on-device capture that prompted the rule.
    */
    const syncTone = () => {
      const y = Math.max(0, window.scrollY);
      const next = (y <= COVER_ABOVE || hidden) && isOverCover();
      if (next !== cover) {
        cover = next;
        setOverCover(next);
      }
    };

    /*
      Reveal on focus whatever the preference: a focus ring parked off-screen
      is a defect (WCAG 2.4.11), not a motion choice. Closing the menu returns
      focus to the trigger, which lives in here. A reveal is a state change
      like any other: it re-anchors direction so the next gesture is measured
      from here, and it re-syncs the tone so a bar that was hidden over the
      cover arrives solid — it is below the top, or it would not have hidden.
    */
    const reveal = () => {
      anchorY = Math.max(0, window.scrollY);
      setHidden(false);
      syncTone();
    };
    header.addEventListener("focusin", reveal);

    function update() {
      frame = 0;
      if (!header) return;

      // Clamp: rubber-band overscroll reports positions outside the document,
      // and a negative delta there would read as "scrolling up".
      const y = Math.max(0, window.scrollY);

      if (y <= REVEAL_ABOVE) {
        anchorY = y;
        setHidden(false);
      } else {
        const delta = y - anchorY;
        // Below the threshold the movement is banked rather than discarded,
        // so `anchorY` deliberately does not move here.
        if (Math.abs(delta) >= DIRECTION_DELTA) {
          anchorY = y;
          setHidden(delta > 0);
        }
      }

      syncTone();
    }

    /*
      The initial paint, through the same rule the frames use: hydration must
      correct the route-list guess — and a hard load restored mid-page must
      open cream, not in the cover's colours the server guessed at.
    */
    cover =
      (Math.max(0, window.scrollY) <= COVER_ABOVE || hidden) && isOverCover();
    setOverCover(cover);

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
