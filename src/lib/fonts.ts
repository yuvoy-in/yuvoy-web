import localFont from "next/font/local";

/**
 * Brand Kit v2.4 (2026-08-05, owner-directed): two families, four files.
 *
 * The v2.2 serif stack (Instrument Serif / Inter / IBM Plex Mono) was retired
 * after repeated feedback that it read as AI-generated — the serif-display +
 * Inter + mono-eyebrow combination is the documented generated-page house
 * style, and Instrument Serif is a named LLM-favourite face. v2.3 answered
 * that with Cabinet Grotesk; v2.4 keeps the structure and swaps only the
 * display face for Poppins (below).
 *
 * Both families are self-hosted rather than fetched from Google at build:
 * no external dependency, no layout shift, and the files are pinned.
 *
 * There is deliberately no italic file anywhere. Emphasis is always the same
 * family, heavier, usually in an accent colour — never a style switch. The
 * hero's turn is the one permitted slant and renders as a synthesized
 * oblique.
 *
 * Weight discipline differs per family, because what is on disk differs:
 * display carries 600 + 700, text carries 400 / 500 / 700. So `font-semibold`
 * is valid **only** on `font-display` elements; on body text the browser
 * would synthesise it.
 */

/**
 * Display face — headlines only, 600 by default, 700 for the turn.
 *
 * Poppins (owner direction, 2026-08-05), taken from the original landing
 * prototype in `claude-artifacts/`. It is the Brand Kit v2 display face
 * returning: v2 shipped Poppins, v2.2 replaced it with Instrument Serif for a
 * more premium register, and v2.3 replaced that with Cabinet Grotesk. The
 * owner asked to try it again on headlines only, so the text voice stays
 * Satoshi rather than reverting to the prototype's Inter.
 *
 * Also Indian Type Foundry, like Satoshi — the foundry story holds.
 */
export const poppins = localFont({
  src: [
    { path: "../fonts/Poppins-600.woff2", weight: "600", style: "normal" },
    { path: "../fonts/Poppins-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-poppins",
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
