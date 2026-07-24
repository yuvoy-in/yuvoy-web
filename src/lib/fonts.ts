import { Fraunces, Inter } from "next/font/google";

/** Display face — cinematic, editorial. Italic reserved for headlines. */
export const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  style: ["normal", "italic"],
});

/** UI + body face — quiet, legible, modern. */
export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
