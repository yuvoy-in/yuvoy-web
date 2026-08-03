import { Instrument_Serif, Inter, IBM_Plex_Mono } from "next/font/google";

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
