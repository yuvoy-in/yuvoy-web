import Image from "next/image";
import { cn } from "@/lib/cn";

/**
 * The Yuvoy mark — the official ensō (white brush ring + terracotta dot) on
 * its forest tile, beside the wide-tracked wordmark and the "Experience
 * more." kicker.
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
 * The mark on its own — the official ensō on its forest tile, for the header,
 * footer and tight slots.
 *
 * The asset is `public/brand/yuvoy-mark.png`, derived from the delivered logo
 * by `scripts/generate-brand-assets.py` (the source PNG has an opaque black
 * field; the script screen-blends it onto forest, which is why no CSS blend
 * tricks are needed here). The favicon and app icon are the same object. On
 * forest surfaces the tile matches its background, so a hairline ring keeps
 * the square legible.
 */
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
        "rounded-edge bg-forest inline-flex size-8 shrink-0 overflow-hidden",
        onDark && "ring-cream/20 ring-1",
        className,
      )}
    >
      <Image
        src="/brand/yuvoy-mark.png"
        alt=""
        width={64}
        height={64}
        className="size-full"
      />
    </span>
  );
}
