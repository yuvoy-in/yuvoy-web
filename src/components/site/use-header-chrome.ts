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
 * **It wears the cover's colours at the very top of a page that has one.** On
 * the homepage the first section is forest, and a cream bar sitting on top of
 * it looks stuck on; at the top the header is transparent instead and its
 * contents turn cream. Any scroll away from the top returns the solid bar
 * (owner's choice, 2026-08-04, over the alternative of tracking the whole
 * cover).
 *
 * The swap is **latched to the header being off-screen**, not to the scroll
 * position that triggers the hide. Those are the same instant, and doing the
 * obvious thing repainted the bar cream in the frame the hide began, so it
 * was seen sliding away in the wrong colour. Held until it has actually left,
 * the change happens where nobody can see it.
 *
 * `hidden` is written straight to the DOM so scrolling never re-renders React.
 * `overCover` is state because the tone genuinely changes the tree — but it
 * flips at most once per journey to the top, not per scroll event.
 */

/** Never hide within this many pixels of the top, and wear the cover here. */
const REVEAL_ABOVE = 8;

/**
 * How far down the page the cover's colours survive if the header never
 * actually leaves the screen.
 *
 * The swap normally waits until the header is off-screen, which is what keeps
 * it invisible. Under reduced motion the header does not hide at all, so that
 * moment never comes — and a transparent bar over page content is an
 * unreadable one. This is the backstop for that case only: far enough down
 * that a visitor whose header does hide has always swapped long before, and
 * still inside the cover, which is a viewport tall.
 */
const COVER_RELEASE = 240;

/** Total movement in one direction before the header changes its mind. */
const DIRECTION_DELTA = 8;

/** Routes whose first section is a dark cover, for the first paint only. */
function isCoverRoute(pathname: string): boolean {
  return pathname === "/" || pathname.startsWith("/go/");
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

    const hasCover = document.querySelector("[data-dark-hero]") !== null;

    // Reveal on focus whatever the preference: a focus ring parked off-screen
    // is a defect (WCAG 2.4.11), not a motion choice. Closing the menu returns
    // focus to the trigger, which lives in here.
    const reveal = () => {
      header.dataset.hidden = "false";
    };
    header.addEventListener("focusin", reveal);

    let anchorY = window.scrollY;
    let hidden = false;
    let cover = hasCover && window.scrollY <= REVEAL_ABOVE;
    let frame = 0;

    setOverCover(cover);

    function update() {
      frame = 0;
      if (!header) return;

      // Clamp: rubber-band overscroll reports positions outside the document,
      // and a negative delta there would read as "scrolling up".
      const y = Math.max(0, window.scrollY);

      /*
        The chrome is latched, not recomputed each frame, and that is the whole
        trick. Falling straight from "at the top" to "not at the top" repainted
        the bar cream in the same frame that started the hide, so a small
        scroll showed a cream bar sliding away — read as a glitch, and rightly
        (owner report, 2026-08-04).

        So the cover's colours are held until the header is genuinely off the
        screen, measured rather than assumed: getBoundingClientRect() reports
        the animated position, so this is only true once the slide has really
        finished. The swap then happens where nobody can see it, and the only
        cross-fade on screen is the deliberate one at the top edge.
      */
      const offScreen = header.getBoundingClientRect().bottom <= 0;
      let nextCover = cover;
      if (!hasCover) nextCover = false;
      else if (y <= REVEAL_ABOVE) nextCover = true;
      else if (offScreen || y > COVER_RELEASE) nextCover = false;

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
    return () => {
      window.removeEventListener("scroll", schedule);
      header.removeEventListener("focusin", reveal);
      if (frame) cancelAnimationFrame(frame);
    };
    // Re-runs on navigation: a new page has a new cover, or none, and starts
    // at the top with a fresh anchor.
  }, [pathname]);

  return { ref, overCover };
}
