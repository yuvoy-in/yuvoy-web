import localFont from "next/font/local";

/**
 * Brand Kit v2.5 (2026-08-06, owner-confirmed): Fraunces + Satoshi.
 *
 * The display face is **Fraunces**, the open-license member of the soft-serif
 * family (Canela, Recoleta, GT Super) that premium travel and island
 * hospitality brands set their identities in. It ships as a variable font
 * and is tuned into the site's own cut in globals.css: optical size pinned
 * at 144, SOFT 75 (terminals rounded, sea-glass), WONK 0. Display weight is
 * **400** (owner pick from a six-weight strip); the turn rides at **480**
 * via the `font-turn` token.
 *
 * Fraunces has **true italics** — the terracotta turn is a real drawn italic
 * for the first time, not a synthesized oblique. Italic is still reserved
 * for the turn alone.
 *
 * Satoshi (400 / 500 / 700) carries body, UI, labels and the wordmark.
 * It has no italic file and no 600: body emphasis stays `font-bold` upright,
 * and `font-semibold` must not appear anywhere in the tree.
 *
 * Both families are self-hosted; five files total, no external requests.
 * Journey here: v2.2 Instrument Serif (read as AI-generated) → v2.3 Cabinet
 * Grotesk → v2.4 Poppins → v2.5 Fraunces, picked over ~350 candidates.
 */

/** Display face — headlines only. Axes are pinned in globals.css. */
export const fraunces = localFont({
  src: [
    {
      path: "../fonts/Fraunces-Variable.woff2",
      weight: "100 900",
      style: "normal",
    },
    {
      path: "../fonts/FrauncesItalic-Variable.woff2",
      weight: "100 900",
      style: "italic",
    },
  ],
  variable: "--font-fraunces",
  display: "swap",
});

/** Body, UI, labels and the wordmark — the site's single text voice. */
export const satoshi = localFont({
  src: [
    { path: "../fonts/Satoshi-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/Satoshi-Medium.woff2", weight: "500", style: "normal" },
    { path: "../fonts/Satoshi-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-satoshi",
  display: "swap",
});
