import localFont from "next/font/local";

/**
 * Brand Kit v2.3 (2026-08-05, owner-directed, skill-audited): two families,
 * five files, no italics.
 *
 * The v2.2 serif stack (Instrument Serif / Inter / IBM Plex Mono) was retired
 * after repeated feedback that it read as AI-generated — the serif-display +
 * Inter + mono-eyebrow combination is the documented generated-page house
 * style, and Instrument Serif is a named LLM-favourite face. The replacement
 * carries premium through letterform character at medium weight, not through
 * contrast or italics.
 *
 * Self-hosted (Fontshare, ITF Free Font License — free for commercial use,
 * no attribution) rather than next/font/google: no external dependency at
 * build, and the families sit outside the generated-page vocabulary.
 *
 * There is deliberately no italic file and no 600 weight in either family.
 * Emphasis is always the same family, heavier (`font-bold`), usually in an
 * accent colour — never a style switch. `font-semibold` must not appear in
 * the tree: with no 600 on disk the browser would synthesise it.
 */

/** Display face — headlines only, 500 by default, 700 for the turn. */
export const cabinetGrotesk = localFont({
  src: [
    {
      path: "../fonts/CabinetGrotesk-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/CabinetGrotesk-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-cabinet-grotesk",
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
