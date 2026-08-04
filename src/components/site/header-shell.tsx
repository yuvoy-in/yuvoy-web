"use client";

import * as React from "react";

/**
 * The header's scroll behaviour: it gets out of the way going down the page
 * and comes back the moment the reader turns around.
 *
 * Only this shell is a client component. The header's contents are passed in
 * as children and stay server-rendered.
 *
 * The details are what separate this from the version that feels broken:
 *
 * - **It never hides near the top.** Within `REVEAL_ABOVE` of the top the
 *   header is always shown, so the first flick of a scroll cannot snatch it
 *   away before the reader has left the cover.
 * - **Direction is measured against a threshold, and the threshold
 *   accumulates.** A trackpad emits a stream of one- and two-pixel deltas,
 *   and reacting to each one makes the header flutter. Movement below
 *   `DIRECTION_DELTA` is not ignored, it is banked, so a slow deliberate
 *   scroll still flips the state at the same total distance as a fast one.
 * - **Focus always wins.** Tabbing into a hidden header would put the focus
 *   ring off-screen (WCAG 2.4.11), and closing the menu returns focus to the
 *   trigger that lives here. A `focusin` listener reveals it in both cases.
 * - **Reduced motion opts out entirely.** Not "the same jump without the
 *   transition": a header that teleports in and out is worse than one that
 *   stays put, so for those visitors it simply stays put.
 *
 * Scrolling never re-renders React. The listener is passive, coalesced into
 * one rAF, and writes a data attribute the stylesheet reacts to.
 */

/** Never hide within this many pixels of the top of the document. */
const REVEAL_ABOVE = 96;

/** Total movement in one direction before the header changes its mind. */
const DIRECTION_DELTA = 8;

export function HeaderShell({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const ref = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    const header = ref.current;
    if (!header) return;

    // Reveal on focus regardless of preference: a focus ring off-screen is a
    // defect, not a motion choice.
    const reveal = () => {
      header.dataset.hidden = "false";
    };
    header.addEventListener("focusin", reveal);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return () => header.removeEventListener("focusin", reveal);
    }

    let anchorY = window.scrollY;
    let hidden = false;
    let frame = 0;

    function update() {
      frame = 0;
      if (!header) return;

      // Clamp: rubber-band overscroll reports positions outside the document,
      // and a negative delta there would read as "scrolling up".
      const y = Math.max(0, window.scrollY);

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
  }, []);

  return (
    <header ref={ref} data-hidden="false" className={className}>
      {children}
    </header>
  );
}
