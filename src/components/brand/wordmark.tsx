import { cn } from "@/lib/cn";

/**
 * The Yuvoy mark — a forest tile carrying the terracotta wave, the wide-tracked
 * wordmark, and the "Experience more." kicker.
 *
 * `tone="onDark"` flips it for forest surfaces. `kicker={false}` and
 * `mark={false}` strip it back for tight contexts (inline in body copy, the
 * mobile menu bar, a favicon-sized slot).
 */
export function Wordmark({
  className,
  tone = "onLight",
  kicker = true,
  mark = true,
}: {
  className?: string;
  tone?: "onLight" | "onDark";
  kicker?: boolean;
  mark?: boolean;
}) {
  const onDark = tone === "onDark";
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      {mark && <WaveMark tone={tone} />}
      <span className="inline-flex flex-col leading-none">
        {/*
          The wordmark stays on the sans (v2.2): the serif is the site's
          editorial voice, the mark is the engineered object it signs.
        */}
        <span
          className={cn(
            "tracking-wordmark font-sans text-sm font-semibold",
            onDark ? "text-cream" : "text-forest",
          )}
        >
          YUVOY
        </span>
        {kicker && (
          <span
            className={cn(
              "label mt-1 text-[0.5rem] leading-none",
              onDark ? "text-terra-soft" : "text-terra-deep",
            )}
          >
            Experience more.
          </span>
        )}
      </span>
    </span>
  );
}

/** The tile + wave glyph, on its own — for favicons, OG frames and tight slots. */
export function WaveMark({
  tone = "onLight",
  className,
}: {
  tone?: "onLight" | "onDark";
  className?: string;
}) {
  const onDark = tone === "onDark";
  return (
    <span
      aria-hidden
      className={cn(
        "rounded-edge inline-flex size-8 shrink-0 items-center justify-center",
        onDark ? "bg-cream/10" : "bg-forest",
        className,
      )}
    >
      <svg viewBox="0 0 28 28" fill="none" className="size-5">
        <path
          d="M5 16q4.5-7 9 0t9 0"
          stroke={onDark ? "var(--color-terra-soft)" : "var(--color-terra)"}
          strokeWidth="2.25"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
