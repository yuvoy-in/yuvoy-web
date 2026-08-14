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
 * ## Why there is no `viewportFit: "cover"` (measured, 2026-08-11)
 *
 * It was added, tested on device, and removed — it is the cause of the
 * flip-flop, not a fix for it. With `cover`, iOS Safari ties the layout
 * viewport's top to its OWN chrome state: scrolling down collapses the top
 * chrome and slides the page edge-to-edge under the Dynamic Island; scrolling
 * up re-expands it and drops the page back below the island. A sticky header
 * at `top: 0` therefore rides under the clock and back out again on every
 * change of direction, and its background changes with whatever section
 * happens to be behind it (owner report, 2026-08-11: "header under island and
 * transparent, then under island and cream, then not under the island at
 * all").
 *
 * Nothing in CSS can compensate: `env(safe-area-inset-top)` reads 0 in every
 * one of those states, so the header cannot know which one it is in. The only
 * lever that removes the instability is removing `cover`, which is what the
 * default does — Safari then keeps the layout viewport below the unsafe area
 * permanently, in every chrome state, and the top edge simply never moves.
 *
 * The immersive look survives without it, because the strip Safari owns above
 * the page is painted from `themeColor` and the canvas: on a forest route both
 * are forest, so the screen reads as one continuous field from the very top
 * whether the chrome is expanded or collapsed. That is the appearance the
 * owner liked, delivered by the mechanism that holds still.
 *
 * The `env()`-based plumbing in the shell stays. It is all max()/calc() over
 * the previous values, so it is inert at zero insets, and it is what makes the
 * layout correct the day the site is opened from the home screen or in an
 * in-app browser that does report insets.
 */
export const CHROME = {
  cream: "#f4efe4",
  forest: "#16362e",
} as const;

/** For routes whose first surface is the cream canvas (the default). */
export const VIEWPORT_ON_CREAM: Viewport = {
  themeColor: CHROME.cream,
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
};
