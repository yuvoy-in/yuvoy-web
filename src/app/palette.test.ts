import { readFileSync, readdirSync } from "node:fs";
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

/**
 * Scan DECLARATIONS, not prose.
 *
 * Every rule in this stylesheet is written down next to the thing it forbids,
 * so the v2.9 block names `cream` and prints #F4EFE4 in its migration table.
 * A scanner that reads comments flags the documentation of the rule, which
 * teaches the next person to delete the explanation rather than obey it.
 */
const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");
const DECLARATIONS = stripComments(CSS);

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

/*
  The palette, as literals — and every one of them is asserted to BE the
  `@theme` token it names before anything is measured against it.

  That tie is the lesson of Brand Kit v2.9. These were plain constants, so
  moving `cream` from #F4EFE4 to #FFFFFF in `globals.css` would have left this
  file measuring the retired colour and reporting green on figures that no
  longer described the site. A test that claims to measure the palette has to
  fail when the palette moves out from under it.
*/
const PAPER = "#ffffff";
const PAPER_DEEP = "#f7f5f1";
const PAPER_LINE = "#edeae4";
const FOREST = "#16362e";
const TERRA = "#be7149";
const TERRA_DEEP = "#985028";
const TERRA_SOFT = "#d89772";
const DEVICE = "#0a100e";

/** The retired surface trio. Banned by name, the way `teal` and `ink` are. */
const RETIRED = ["#f4efe4", "#ece5d6", "#e5dcc9"];

describe("the tokens these tests measure", () => {
  it("are the tokens the theme actually declares", () => {
    for (const [name, hex] of [
      ["paper", PAPER],
      ["paper-deep", PAPER_DEEP],
      ["paper-line", PAPER_LINE],
      ["forest", FOREST],
      ["terra", TERRA],
      ["terra-deep", TERRA_DEEP],
      ["terra-soft", TERRA_SOFT],
      ["device", DEVICE],
    ] as const) {
      expect(THEME).toContain(`--color-${name}: ${hex}`);
    }
  });

  it("no longer carry the retired cream trio, by name or by value", () => {
    // The name: `bg-cream` on a new section is the first way this comes back.
    expect(DECLARATIONS).not.toMatch(/--color-cream\b/);
    // The values: a hand-typed #F4EFE4 anywhere in the stylesheet is the
    // second way, and it would not fail any contrast assertion on its own.
    for (const hex of RETIRED)
      expect(DECLARATIONS.toLowerCase()).not.toContain(hex);
  });

  /*
    The two steps that make a card a card.

    Nothing else would catch losing them. Every TEXT pairing gets better as
    the supports lighten, so a flattened ramp — paper-deep or paper-line
    drifting toward #FFFFFF — passes every contrast assertion in this file
    while the panels and dividers quietly vanish off the page. v2.9 preserved
    the SEPARATION rather than the hue, and this is where that promise lives.
  */
  it("keeps the canvas, the raised surface and the hairline apart", () => {
    expect(contrast(PAPER, PAPER_DEEP)).toBeCloseTo(1.09, 2);
    expect(contrast(PAPER, PAPER_LINE)).toBeCloseTo(1.2, 2);
  });
});

describe("the dark surface", () => {
  it("is declared exactly once in the theme", () => {
    expect(THEME).toContain(`--color-forest: ${FOREST}`);
    // The names of the two darks this replaced. Either reappearing means a
    // second dark surface is back, and with it the bug that was reported
    // three times.
    expect(THEME).not.toMatch(/--color-(teal|ink)\b/);
  });

  /*
    `device` is the preview bezel's near-black. It is an OBJECT's colour,
    not a second dark surface, and the only thing keeping those two facts
    apart is that exactly one element in the app wears it. The moment a
    section does, the site has two darks again — which is the bug that was
    reported three times before it was fixed as one.
  */
  it("keeps the device colour on the device alone", () => {
    expect(THEME).toContain(`--color-device: ${DEVICE}`);
    // Darker than the ink, or it is not reading as hardware.
    expect(luminance(DEVICE)).toBeLessThan(luminance(FOREST));

    const source = readdirSync(join(process.cwd(), "src"), {
      recursive: true,
      withFileTypes: true,
    })
      .filter((entry) => entry.isFile() && /\.tsx?$/.test(entry.name))
      .map((entry) => readFileSync(join(entry.parentPath, entry.name), "utf8"))
      .join("\n");

    // `rounded-device` and `device-shadow` are the frame's other two
    // device-only rules and are matched out by the word boundary.
    expect(source.match(/\bbg-device\b/g) ?? []).toHaveLength(1);
  });

  it("clears AAA for body text in both directions", () => {
    expect(contrast(FOREST, PAPER)).toBeGreaterThanOrEqual(7);
  });

  it("holds every rung of the opacity ladder", () => {
    // Documented in DESIGN_SYSTEM §1. These are the floors the site's muted
    // text sits on; a retune of `forest` that breaks one breaks real copy.
    expect(contrast(over(FOREST, PAPER, 0.7), PAPER)).toBeGreaterThanOrEqual(
      4.5,
    );
    expect(contrast(over(FOREST, PAPER, 0.75), PAPER)).toBeGreaterThanOrEqual(
      4.5,
    );
    expect(contrast(over(PAPER, FOREST, 0.6), FOREST)).toBeGreaterThanOrEqual(
      4.5,
    );
    expect(contrast(over(PAPER, FOREST, 0.7), FOREST)).toBeGreaterThanOrEqual(
      4.5,
    );
  });

  /*
    The ladder's floors are measured against `paper`, and a recessed surface
    spends the headroom they leave: the why act's inactive tab is `forest/5`
    on `paper-deep`, and `forest/60` on it renders 3.60:1 — which is what
    axe caught the first time that panel was built. Two rungs are pinned
    here so the next panel that recesses a fill cannot rediscover it.
  */
  it("holds the ladder on a tinted raised surface", () => {
    const recessed = over(FOREST, PAPER_DEEP, 0.05);
    expect(contrast(over(FOREST, recessed, 0.6), recessed)).toBeLessThan(4.5);
    expect(
      contrast(over(FOREST, recessed, 0.75), recessed),
    ).toBeGreaterThanOrEqual(4.5);
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
