"use client";

import * as React from "react";
import { cn } from "@/lib/cn";
import { AUDIENCE_COPY, AUDIENCE_ORDER } from "@/lib/site/audiences";
import type { LeadAudience } from "@/lib/leads/registry";

/**
 * The `/waitlist` audience switch — two tabs that change the whole page.
 *
 * ## Why it is a real tablist
 *
 * Because it now controls a real tabpanel. It used to sit above two forms and
 * swap only those; everything a visitor read — the eyebrow, the headline, the
 * promise underneath it, the questions — belonged to the traveller and stayed
 * put whichever tab was selected. What it switches now is the page, so it is
 * built to the APG tabs pattern rather than approximately to it:
 *
 * - **Roving tabindex.** One tab stop for the group, not one per tab. Tabbing
 *   past the switch reaches the form, which is where somebody is going.
 * - **Arrow keys, Home and End move between tabs**, with selection following
 *   focus (automatic activation) — correct here because switching costs
 *   nothing but a re-render, and it is what a keyboard user expects from a
 *   two-item switch.
 * - `aria-selected` and `aria-controls` name the panel, so assistive tech
 *   announces the relationship rather than two unlabelled buttons.
 *
 * ## The labels
 *
 * First person and mutually exclusive — "I'm travelling" / "I run
 * experiences". Below each, the act it leads to ("Join the waitlist" /
 * "Apply as an operator"), because the difference between the two sides is a
 * difference in what happens next, and a visitor should not have to press one
 * to find out. Both come from `AUDIENCE_COPY`, so they cannot disagree with
 * the page they open.
 */
export function AudienceTabs({
  value,
  onSelect,
  className,
}: {
  value: LeadAudience;
  /** Called for a genuine change only; the component never re-selects itself. */
  onSelect: (next: LeadAudience) => void;
  className?: string;
}) {
  const listRef = React.useRef<HTMLDivElement>(null);

  function move(next: LeadAudience) {
    onSelect(next);
    // Selection follows focus, so focus has to follow selection. Both tabs are
    // always mounted, so the node exists before this runs.
    listRef.current?.querySelector<HTMLButtonElement>(`#tab-${next}`)?.focus();
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const current = AUDIENCE_ORDER.indexOf(value);
    const last = AUDIENCE_ORDER.length - 1;
    let next: LeadAudience | undefined;

    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        next = AUDIENCE_ORDER[(current + 1) % AUDIENCE_ORDER.length];
        break;
      case "ArrowLeft":
      case "ArrowUp":
        next = AUDIENCE_ORDER[(current + last) % AUDIENCE_ORDER.length];
        break;
      case "Home":
        next = AUDIENCE_ORDER[0];
        break;
      case "End":
        next = AUDIENCE_ORDER[last];
        break;
      default:
        return;
    }

    // Only after a key we own: preventing default on anything else would eat
    // Tab, Enter and the page's own scrolling.
    event.preventDefault();
    if (next && next !== value) move(next);
  }

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label="I am"
      aria-orientation="horizontal"
      onKeyDown={onKeyDown}
      className={cn(
        "border-paper/20 rounded-edge mx-auto grid w-full max-w-lg grid-cols-2 gap-1 border p-1",
        className,
      )}
    >
      {AUDIENCE_ORDER.map((audience) => {
        const copy = AUDIENCE_COPY[audience];
        const selected = audience === value;
        return (
          <button
            key={audience}
            type="button"
            role="tab"
            id={`tab-${audience}`}
            aria-selected={selected}
            aria-controls={`panel-${audience}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => {
              if (!selected) onSelect(audience);
            }}
            className={cn(
              "rounded-edge focus-visible:ring-terra-soft ease-interaction flex flex-col items-center justify-center gap-1 px-3 py-3 transition-colors duration-200 focus-visible:ring-2 focus-visible:outline-none",
              selected
                ? // `paper-deep`, not `paper`: against saturated forest, pure
                  // paper reads as white (design system §5). Same fill as the
                  // `paper` button, 10.49:1.
                  "bg-paper-deep text-forest"
                : "text-paper/70 hover:bg-paper/5 hover:text-paper",
            )}
          >
            <span className="text-sm leading-snug font-medium">
              {copy.tabLabel}
            </span>
            {/*
              The act each side leads to. Hidden from assistive tech: the tab's
              accessible name should be the choice itself, and appending "Join
              the waitlist" to it would have a screen reader announce an action
              that pressing the tab does not perform.
            */}
            <span
              aria-hidden
              /* `terra-deep` on the selected fill and `paper/70` on the
                 forest one: the two accent pairings §1 measures for these
                 grounds (5.21:1 and 6.45:1). Nothing quieter — this is 12px
                 type, so anything below AA's 4.5:1 is unreadable rather than
                 subtle. */
              className={cn(
                "label",
                selected ? "text-terra-deep" : "text-paper/70",
              )}
            >
              {copy.tabHint}
            </span>
          </button>
        );
      })}
    </div>
  );
}
