import { Poppins, Inter, IBM_Plex_Mono } from "next/font/google";

/**
 * Display face — geometric, heavy, confident. Italic is reserved for the
 * second line of a headline (the terracotta "turn"), which is the brand's
 * single most recognisable typographic move.
 *
 * Poppins is not a variable font on Google Fonts, so weights are explicit and
 * deliberately few — each weight/style pair is a separate file to download.
 */
export const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
  weight: ["600", "700", "800"],
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
 * metadata. The editorial counterweight to Poppins' mass.
 */
export const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plex-mono",
  display: "swap",
  weight: ["400", "500", "600"],
});
