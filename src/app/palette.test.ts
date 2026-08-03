import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";

/**
 * The dark surface, guarded.
 *
 * The site carried two darks — `teal` #0D3B3E and `ink` #22302E — and the
 * second one was reported as a visual bug three times before it was fixed as
 * one. Nothing in the type system stops someone reintroducing a second dark
 * token, so this does: one dark in the theme, and the contrast it is chosen
 * for pinned to a number.
 */
const CSS = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");
const THEME = CSS.slice(CSS.indexOf("@theme {"), CSS.indexOf("@layer base"));

/** WCAG 2.2 relative luminance (sRGB). */
function luminance(hex: string): number {
  const channel = (c: number) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  const [r, g, b] = [1, 3, 5].map((i) =>
    channel(parseInt(hex.slice(i, i + 2), 16) / 255),
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [la, lb] = [luminance(a), luminance(b)];
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Composite a colour at `alpha` over an opaque background. */
const over = (fg: string, bg: string, alpha: number) =>
  "#" +
  [1, 3, 5]
    .map((i) =>
      Math.round(
        alpha * parseInt(fg.slice(i, i + 2), 16) +
          (1 - alpha) * parseInt(bg.slice(i, i + 2), 16),
      )
        .toString(16)
        .padStart(2, "0"),
    )
    .join("");

const CREAM = "#f4efe4";
const FOREST = "#16362e";
const TERRA_SOFT = "#d89772";

describe("the dark surface", () => {
  it("is declared exactly once in the theme", () => {
    expect(THEME).toContain(`--color-forest: ${FOREST}`);
    // The names of the two darks this replaced. Either reappearing means a
    // second dark surface is back, and with it the bug that was reported
    // three times.
    expect(THEME).not.toMatch(/--color-(teal|ink)\b/);
  });

  it("clears AAA for body text in both directions", () => {
    expect(contrast(FOREST, CREAM)).toBeGreaterThanOrEqual(7);
  });

  it("holds every rung of the opacity ladder", () => {
    // Documented in DESIGN_SYSTEM §1. These are the floors the site's muted
    // text sits on; a retune of `forest` that breaks one breaks real copy.
    expect(contrast(over(FOREST, CREAM, 0.7), CREAM)).toBeGreaterThanOrEqual(
      4.5,
    );
    expect(contrast(over(FOREST, CREAM, 0.75), CREAM)).toBeGreaterThanOrEqual(
      4.5,
    );
    expect(contrast(over(CREAM, FOREST, 0.6), FOREST)).toBeGreaterThanOrEqual(
      4.5,
    );
    expect(contrast(over(CREAM, FOREST, 0.7), FOREST)).toBeGreaterThanOrEqual(
      4.5,
    );
  });

  /*
    The check that decided #16362E over the lighter #1B4138. The accent on a
    dark surface is the tightest pairing in the palette; the lighter green
    cleared the floor by 0.12, which is close enough that any later tweak to
    the terracotta would have broken it silently.
  */
  it("leaves real headroom on the tightest pairing", () => {
    expect(contrast(TERRA_SOFT, FOREST)).toBeGreaterThanOrEqual(4.5 + 0.5);
  });
});
