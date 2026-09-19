import { cn } from "@/lib/cn";
import type { Faq } from "@/lib/site/faqs";

/**
 * A short FAQ, as native disclosure widgets.
 *
 * Built on `<details>` / `<summary>` rather than a hand-rolled accordion, for
 * the same reason the site menu is a native `<dialog>`: the browser already
 * provides the keyboard behaviour (Enter and Space toggle, the summary is
 * focusable, the state is exposed to assistive tech as expanded/collapsed) and
 * a re-implementation can only drift out of sync with the markup. It also
 * ships zero JavaScript, which matters for a block that sits below a form.
 *
 * The marker is drawn, not typed: `list-style: none` via `marker:hidden` plus
 * a rotating plus, so it reads as the editorial system rather than as a
 * browser default triangle. The rotation is on the interaction budget and is
 * neutralised by the global reduced-motion rule like everything else.
 *
 * `tone` follows the surface it sits on, per design system §1's measured
 * pairings — there is no third option because there are only two surfaces.
 */
export function FaqAccordion({
  items,
  tone = "paper",
  className,
}: {
  items: Faq[];
  tone?: "paper" | "ink";
  className?: string;
}) {
  const dark = tone === "ink";

  return (
    <div
      className={cn(
        "border-t",
        dark ? "border-paper/12" : "border-paper-line",
        className,
      )}
    >
      {items.map((item) => (
        <details
          key={item.question}
          className={cn(
            "group border-b",
            dark ? "border-paper/12" : "border-paper-line",
          )}
        >
          <summary
            className={cn(
              // `marker:hidden` alone is not enough in every engine; the
              // pseudo-element rule in globals.css covers WebKit's own marker.
              "faq-summary flex cursor-pointer items-start justify-between gap-6 py-6 transition-colors duration-200 focus-visible:ring-2 focus-visible:outline-none",
              dark
                ? "focus-visible:ring-terra-soft hover:text-paper"
                : "focus-visible:ring-terra-deep hover:text-terra-deep",
            )}
          >
            <span className="font-display tracking-display text-lg leading-snug font-normal sm:text-xl">
              {item.question}
            </span>
            {/* The marker: a plus that becomes a minus. Two lines, one of
                which rotates away, so there is a single glyph to align
                rather than two icons to keep the same optical weight. */}
            <span
              aria-hidden
              className={cn(
                "relative mt-2 size-3 flex-none",
                dark ? "text-terra-soft" : "text-terra-deep",
              )}
            >
              <span className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-current" />
              <span className="ease-interaction absolute top-1/2 left-0 h-px w-full -translate-y-1/2 rotate-90 bg-current transition-transform duration-200 group-open:rotate-0" />
            </span>
          </summary>
          <p
            className={cn(
              "max-w-prose pb-6 leading-relaxed",
              dark ? "text-paper/70" : "text-forest/75",
            )}
          >
            {item.answer}
          </p>
        </details>
      ))}
    </div>
  );
}
