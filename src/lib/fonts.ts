import {
  Dancing_Script,
  Instrument_Serif,
  Inter,
  IBM_Plex_Mono,
} from "next/font/google";

/**
 * Display face — an editorial serif, set large and light. Brand Kit v2.2:
 * headlines carry their mass through size and tight leading, never through
 * weight (the face ships a single 400). Italic is reserved for the terracotta
 * "turn" — the second thought of a headline — which stays the brand's most
 * recognisable typographic move.
 *
 * Instrument Serif ships exactly one weight, which is a feature: two font
 * files total, and no faux-bold anywhere because there is no bold to reach
 * for.
 */
export const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  display: "swap",
  weight: "400",
  style: ["normal", "italic"],
});

/**
 * Script face — cursive handwriting, used ONLY by the brand veil's
 * "Experience more." statement (owner direction: the line should read as
 * being written by hand). Dancing Script replaced Great Vibes on owner
 * feedback: simpler, cleaner loops, better legibility at display size.
 * One place; it must not leak into page typography, which stays the
 * display/body pair.
 */
export const dancingScript = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-dancing-script",
  display: "swap",
});

/** UI + body face — quiet, legible, modern. */
export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

/**
 * Label face — wide-tracked uppercase mono for eyebrows, nav, stats and
 * metadata. The engineered counterweight to the serif's warmth.
 */
export const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plex-mono",
  display: "swap",
  weight: ["400", "500", "600"],
});
