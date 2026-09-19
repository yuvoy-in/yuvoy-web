import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * A compact statement of where the product actually is.
 *
 * This replaces the full-width "what this is not" sections that used to run
 * down the operator and safety pages. The information in them was right and is
 * kept; the presentation was not, because a list of five things you have not
 * built, set at section scale, reads as a page arguing with itself.
 *
 * **Design contract: visible, never dominant.** One hairline-bordered block,
 * body-sized type, a terracotta marker, and a measure that keeps it to a few
 * lines. If a status notice needs a heading and a list, the copy is too long
 * and belongs in the FAQ instead.
 *
 * It is a `<p>`-level statement, not a landmark, so it takes no heading and
 * no role: nothing here is an alert, and announcing it as one would interrupt
 * a screen reader for a fact the page states calmly.
 */
export function StatusNotice({
  label,
  children,
  tone = "paper",
  className,
}: {
  /** Optional short prefix, e.g. "Pre-launch". Omit where context is obvious. */
  label?: string;
  children: ReactNode;
  tone?: "paper" | "ink";
  className?: string;
}) {
  const dark = tone === "ink";

  return (
    <div
      className={cn(
        "rounded-edge max-w-2xl border p-6 sm:p-7",
        dark ? "border-paper/20 bg-paper/5" : "border-paper-line bg-paper-deep",
        className,
      )}
    >
      {label && (
        <p
          className={cn(
            "label mb-3",
            dark ? "text-terra-soft" : "text-terra-deep",
          )}
        >
          {label}
        </p>
      )}
      <div
        className={cn(
          "flex gap-4 text-sm leading-relaxed",
          dark ? "text-paper/70" : "text-forest/75",
        )}
      >
        {!label && (
          <span
            aria-hidden
            className={cn(
              "mt-2 size-1 shrink-0",
              dark ? "bg-terra-soft" : "bg-terra",
            )}
          />
        )}
        <div className="[&>p+p]:mt-3">{children}</div>
      </div>
    </div>
  );
}
