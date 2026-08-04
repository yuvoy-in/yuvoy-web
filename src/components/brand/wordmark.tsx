import Image from "next/image";
import { cn } from "@/lib/cn";

/**
 * The Yuvoy mark — the official ensō (brush ring + terracotta dot), beside
 * the wide-tracked wordmark and the "Experience more." kicker.
 *
 * `tone="onDark"` flips it for forest surfaces. `kicker={false}` and
 * `mark={false}` strip it back for tight contexts (inline in body copy, the
 * menu bar, a favicon-sized slot).
 *
 * **Give it a flex or grid parent.** It is `inline-flex`, so in a plain block
 * or inline container it sits on a line box's baseline and the strut reserves
 * descender space beneath it — dead space inside the parent that makes the
 * mark look high and its container bottom-heavy. That is exactly what was
 * reported of the header on 2026-08-04; the fix was `flex` on the link, not a
 * nudge on the mark. Pass `className="flex"` where the parent cannot change.
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
        {/*
          The kicker is a decorative flourish: the mark and the wordmark carry
          the identity, and wherever the Wordmark is a link the link carries
          its own accessible name. aria-hidden also keeps axe's colour checks
          off an 8px ornament whose background it mis-attributes through the
          mobile menu's top layer.
        */}
        {kicker && (
          <span
            aria-hidden
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

/**
 * The mark on its own — the official ensō, cut out of its background, for the
 * header, footer and tight slots.
 *
 * **No tile.** The delivered logo is a white ensō on an opaque black field, so
 * the first version of this baked that field into forest and shipped a square.
 * On a forest section that square was a green box drawn around a logo that
 * should have had none. `scripts/generate-brand-assets.py` now cuts the mark
 * out instead, producing one file per surface — the strokes cannot be a single
 * colour, because a cream ensō is invisible on cream and a forest one is
 * invisible on forest. The tiled version survives only where an icon genuinely
 * needs a body: the favicon, the app icon and the OG card.
 *
 * **Both files render, and opacity does the switching.** Swapping the `src`
 * would send the browser to fetch the other file at the moment the header
 * changes colour, which is the one moment it must not blink. They cross-fade
 * with the bar instead.
 */
const MARK_SIZE = 128; // 4× the 32px it draws at, so it stays crisp at 3× DPR.

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
      className={cn("relative block size-8 shrink-0", className)}
    >
      {(
        [
          ["/brand/yuvoy-mark-on-light.png", !onDark],
          ["/brand/yuvoy-mark-on-dark.png", onDark],
        ] as const
      ).map(([src, shown]) => (
        <Image
          key={src}
          src={src}
          alt=""
          width={MARK_SIZE}
          height={MARK_SIZE}
          // A logo is not a photograph: re-encoding it lossily is exactly the
          // "downgraded" look the optimiser's default quality produces.
          quality={100}
          priority
          className={cn(
            "absolute inset-0 size-full transition-opacity duration-300",
            shown ? "opacity-100" : "opacity-0",
          )}
        />
      ))}
    </span>
  );
}
