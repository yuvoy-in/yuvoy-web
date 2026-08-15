import { cn } from "@/lib/cn";

/**
 * The hairline glyph set `/contact` draws with.
 *
 * ## Why icons exist here and nowhere else on the site
 *
 * The design system's rule is that hairlines do the work boxes and shadows do
 * elsewhere, and until now that has meant no icons at all: an editorial page
 * says what it means in type. `/contact` is the one page that is a *utility* —
 * a visitor arrives having decided to act, and scans for the fastest way to do
 * it. A glyph is read before a word is, which is worth exactly one page.
 *
 * So they are drawn to the hairline spec rather than imported from a set:
 * `1.5` stroke, `square` caps, `miter` joins, no fill, `currentColor`
 * throughout. That is `ButtonArrow`'s spec at icon scale (it uses `1.75` at
 * 14px; these render at 20-24px, where 1.75 reads heavy). Square caps and
 * mitred joins are the same decision the 2px radius is: the brand is
 * rectangular, and a rounded-cap icon set would be the one soft object on a
 * page of sharp ones.
 *
 * **No icon here carries meaning on its own.** Every one sits beside the words
 * it illustrates and is `aria-hidden`, so nothing is lost when they do not
 * load, do not render, or are read by a screen reader that ignores them.
 *
 * Twenty-unit viewBox for the glyph set. The two that are not glyphs carry
 * their own grid: `PlaneOrnament` is 64x44 because a trail needs room to be a
 * trail, and `CheckRing` is 24 because it renders at 3x the glyph size, where
 * a 20-unit grid would put the ring's stroke on a half pixel.
 */

interface IconProps {
  className?: string;
}

/** Shared frame: no fill, hairline stroke, square-cut, decorative. */
function Glyph({
  className,
  children,
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={cn("shrink-0", className)}
    >
      {children}
    </svg>
  );
}

/** Email. A sealed envelope, flap drawn rather than implied. */
export function MailIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <path d="M2.75 5h14.5v10H2.75z" />
      <path d="M2.75 5 10 10.6 17.25 5" />
    </Glyph>
  );
}

/**
 * WhatsApp. The bubble and the handset, not the wordmark.
 *
 * Drawn rather than taken from the brand's own asset on purpose: the official
 * mark is a solid green tile, which would be the only filled logo, the only
 * off-palette colour and the only rounded object on the page all at once. This
 * is the shape people recognise, in the page's own ink.
 */
export function WhatsappIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      {/* Bubble, with the tail cut into its lower-left as one closed outline. */}
      <path d="M10 2.9a7 7 0 0 0-5.94 10.7L2.9 17.1l3.55-1.13A7 7 0 1 0 10 2.9Z" />
      {/* Handset: the receiver's two ends and the sweep between them. */}
      <path d="M7.35 7.2h1.2l.85 2-.95.9a5 5 0 0 0 2.1 2.1l.9-.95 2 .85v1.2a.9.9 0 0 1-.95.9 7.1 7.1 0 0 1-6.1-6.1.9.9 0 0 1 .95-.9Z" />
    </Glyph>
  );
}

/** Real people. A figure, because the claim is about who is on the other end. */
export function PersonIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <circle cx="10" cy="6.6" r="3.1" />
      <path d="M3.8 17.1a6.2 6.2 0 0 1 12.4 0" />
    </Glyph>
  );
}

/** A person reads every message. An eye, open. */
export function ReadIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <path d="M1.6 10S4.9 4.9 10 4.9 18.4 10 18.4 10 15.1 15.1 10 15.1 1.6 10 1.6 10Z" />
      <circle cx="10" cy="10" r="2.4" />
    </Glyph>
  );
}

/** Your privacy is respected. A closed padlock. */
export function LockIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <path d="M3.6 8.7h12.8v8.4H3.6z" />
      <path d="M6.5 8.7V6.1a3.5 3.5 0 0 1 7 0v2.6" />
    </Glyph>
  );
}

/** We care about your experience. A heart, drawn with the same flat cut. */
export function HeartIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <path d="M10 16.8S2.6 12.2 2.6 7.9a3.7 3.7 0 0 1 7.4-1.5 3.7 3.7 0 0 1 7.4 1.5c0 4.3-7.4 8.9-7.4 8.9Z" />
    </Glyph>
  );
}

/**
 * The note card's ornament: a paper dart with the trail it left.
 *
 * It is the one drawing on the page that is not a diagram of something — the
 * gesture of sending, put where the eye lands after the card's title. Wider
 * than it is tall (64x44) because a trail needs room to be a trail; anything
 * squarer reads as a logo.
 */
export function PlaneOrnament({ className }: IconProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 64 44"
      fill="none"
      stroke="currentColor"
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={cn("shrink-0", className)}
    >
      <path d="M38 21 62 5 54 34.5 48.4 25.6Z" strokeWidth="1.5" />
      <path d="M48.4 25.6 62 5" strokeWidth="1.5" />
      {/* The trail, dashed so it reads as a path travelled rather than a wire.
          The loop is what makes it a flight and not an arrow. */}
      <path
        d="M38 21c-7.4 4.6-11.2 10.4-17 8.6-5-1.6-3.6-8.4 1.8-7.2 5.4 1.2 3.6 8.6-4 10.4-5 1.2-10-1-14-5"
        strokeWidth="1.2"
        strokeDasharray="1.5 4"
      />
    </svg>
  );
}

/*
  A `HorizonRule` lived here until 2026-08-12 — a drawn terracotta wave that
  divided the lede from "Reach us directly". Removed on owner direction, and
  deleted rather than kept as an unused export: a component nothing renders is
  a component nobody maintains, and the next person to find it has no way to
  tell a deliberate removal from an accidental one. It is in the history.
*/

/** The success mark: a check inside a ring. */
export function CheckRing({ className }: IconProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={cn("shrink-0", className)}
    >
      <circle cx="12" cy="12" r="11" strokeWidth="1.2" />
      <path d="m6.8 12.3 3.5 3.4L17.2 8.4" strokeWidth="1.5" />
    </svg>
  );
}
