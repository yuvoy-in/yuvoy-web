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
 * cover). That is what makes the change invisible in practice: it happens
 * while the header is hidden, so the only cross-fade a visitor ever sees is
 * the one at the top edge, which is deliberate.
 *
 * `hidden` is written straight to the DOM so scrolling never re-renders React.
 * `overCover` is state because the tone genuinely changes the tree — but it
 * flips at most once per journey to the top, not per scroll event.
 */

/** Never hide within this many pixels of the top, and wear the cover here. */
const REVEAL_ABOVE = 8;

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

      const nextCover = hasCover && y <= REVEAL_ABOVE;
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
