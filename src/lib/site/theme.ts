import type { Viewport } from "next";

/**
 * The browser-chrome colour, per surface — the one place the palette's hex
 * values may appear outside `globals.css` (metadata cannot read a CSS custom
 * property; the OG frame carries the same literals for the same reason).
 * Mirror of `--color-cream` / `--color-forest`; change them together.
 *
 * ## Why this exists (measured on an iPhone, iOS 26.5, 2026-08-11)
 *
 * In-browser iOS Safari never lays a page out under the Dynamic Island:
 * `env(safe-area-inset-top)` reads 0 in every chrome state even with
 * `viewport-fit=cover` (the on-device probe at /debug/safe-area proved it).
 * The strip under the island belongs to Safari, which paints it as an
 * adaptive glass **tinted by theme-color**.
 *
 * With one global cream theme-color, that glass rendered a CREAM cap over
 * the FOREST covers — the "sometimes under the island, sometimes a cream
 * band" glitch the owner reported. The routes whose first surface is forest
 * therefore declare a forest theme-color: Safari's glass then agrees with
 * the cover beneath it, the top edge reads as one continuous field (the
 * "under the island" look, delivered by the mechanism Safari actually
 * honours), and over the later cream sections the same route keeps a
 * consistent, deliberate dark cap instead of flickering between tones.
 *
 * The old sampling bug this system replaces: with NO explicit theme-color,
 * Safari samples the page's top pixels — during the brand veil that meant
 * green chrome over a cream page (owner report, 2026-08-06). Explicit
 * per-route colours keep that fixed: on the forest routes the veil, the
 * cover and the chrome are now all the same forest.
 *
 * `viewportFit: "cover"` rides in both objects so a page-level export can
 * never silently drop it, whatever Next's viewport merge rules do. It is
 * inert in-browser on iOS today (insets read 0) but is what makes the
 * safe-area plumbing live the day the page is opened from the home screen,
 * in an in-app browser that honours it, or on a Safari that changes its
 * mind — and the plumbing is all max()/calc() over the old values, so it
 * costs nothing meanwhile.
 */
export const CHROME = {
  cream: "#f4efe4",
  forest: "#16362e",
} as const;

/** For routes whose first surface is the cream canvas (the default). */
export const VIEWPORT_ON_CREAM: Viewport = {
  themeColor: CHROME.cream,
  viewportFit: "cover",
};

/**
 * For routes that open on a forest cover: `/`, `/explore`, `/operators`,
 * `/about`, `/contact`, `/go/[source]`, `/waitlist`. Add the export in the
 * same change that gives a route a dark first surface — the header's
 * `COVER_ROUTES` list in use-header-chrome.ts is the companion registry,
 * and `/waitlist` (which has no site header) is the one entry here that is
 * not also there.
 */
export const VIEWPORT_ON_FOREST: Viewport = {
  themeColor: CHROME.forest,
  viewportFit: "cover",
};
