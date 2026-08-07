import type { MetadataRoute } from "next";

/**
 * The web app manifest.
 *
 * Its job here is narrow and worth stating, because a manifest invites scope
 * creep: it gives Android a name and an icon when somebody adds the site to
 * their home screen, and it tells the browser what colour the surrounding
 * chrome should be. That is all.
 *
 * **`display: "browser"`, not `"standalone"`.** Standalone tells the platform
 * this is an installable application and lets Chrome offer an install prompt
 * for it. Yuvoy is a website; the product it describes is not built. Claiming
 * app-ness in a manifest is the same class of overstatement as a Book button
 * that cannot book, and it would put a chrome-less shell of a marketing site
 * on somebody's home screen.
 *
 * Icons come from the same generated set as the favicon
 * (`scripts/generate-icons.mjs`) rather than from separate files, so there is
 * one mark and one place it is drawn.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Yuvoy",
    short_name: "Yuvoy",
    description:
      "Discover real experiences through videos from the people who run them.",
    start_url: "/",
    display: "browser",
    // Both are the canvas token from globals.css. A literal because a
    // manifest cannot read a CSS custom property — the same reason the
    // viewport's themeColor and the OG card carry literals.
    background_color: "#f4efe4",
    theme_color: "#f4efe4",
    icons: [
      {
        src: "/icon.svg",
        type: "image/svg+xml",
        sizes: "any",
        purpose: "any",
      },
      {
        src: "/icon.png",
        type: "image/png",
        sizes: "512x512",
        purpose: "any",
      },
      {
        src: "/apple-icon.png",
        type: "image/png",
        sizes: "180x180",
        purpose: "any",
      },
    ],
  };
}
