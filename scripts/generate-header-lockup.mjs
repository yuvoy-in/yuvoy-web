/**
 * Derives the two surface variants of the horizontal header lockup from the
 * owner-delivered source (2026-08-06). Never hand-edit the outputs — change
 * the source and re-run: node scripts/generate-header-lockup.mjs
 *
 * The delivered file is drawn for forest surfaces: cream strokes (#F4EFE4)
 * with terra-soft accents (#D79772). It is a brand delivery, so those are its
 * colours forever and this script does not ask it to change.
 *
 * ## Both variants are recoloured, and neither names a hex of ours (v2.9)
 *
 * The canvas used to BE cream, so the dark variant was the delivered art
 * passed straight through and only the light one was recoloured. Since v2.9
 * the canvas is `paper` #FFFFFF, and a cream mark beside paper text measures
 * 1.15:1 — the "two whites" version of the failure Brand Kit v2.1 fixed when
 * it merged two darks. So the dark variant now maps the delivered light tone
 * onto `--color-paper`, and the light variant onto `--color-forest`.
 *
 * Every destination hex is READ from the `@theme` block rather than typed
 * here, so a future retune of the palette follows automatically and this file
 * can never quietly disagree with the stylesheet.
 *
 * ## Each swap is asserted on its own
 *
 * The previous guard compared the whole output to the whole input and passed
 * as long as ANY replacement landed. When the canvas was renamed, the stroke
 * swap silently stopped matching while the accent swap went on matching — and
 * the light lockup shipped cream strokes on a white bar, which is invisible.
 * A missed swap now throws, per replacement.
 */
import { readFileSync, writeFileSync } from "node:fs";

const SRC = "public/brand/Yuvoy_Horizontal_Header_Lockup_Transparent.svg";
const GLOBALS = "src/app/globals.css";

/** A `--color-<name>` hex out of the `@theme` block, uppercased to match the art. */
function token(name) {
  const css = readFileSync(GLOBALS, "utf8");
  const hex = new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})`).exec(
    css,
  )?.[1];
  if (!hex) throw new Error(`no --color-${name} in ${GLOBALS}`);
  return hex.toUpperCase();
}

/** The delivered art's own two tones. Not ours — they belong to the source file. */
const DELIVERED_LIGHT = "#F4EFE4";
const DELIVERED_ACCENT = "#D79772";

/*
 * The delivered canvas is 1600x500, but the drawing occupies only 77% x 67%
 * of it (alpha bounding box of the matching 2x PNG, measured with PIL:
 * x 92-1327, y 90-425 in SVG units). Rendered as delivered, a "56px" logo
 * showed ~37px of artwork — which is why size steps looked like nothing
 * (owner report, 2026-08-06). The variants crop the viewBox to the art plus
 * a 6-unit pad, so a CSS height means drawing height. Re-measure and update
 * ART if the source file is ever replaced.
 */
const ART = { x: 92, y: 90, w: 1235, h: 335 };
const PAD = 6;
const VIEWBOX = `${ART.x - PAD} ${ART.y - PAD} ${ART.w + 2 * PAD} ${ART.h + 2 * PAD}`;

const delivered = readFileSync(SRC, "utf8");
const CANVAS = 'width="1600" height="500" viewBox="0 0 1600 500"';
if (!delivered.includes(CANVAS))
  throw new Error(
    "source canvas changed; re-measure ART and update this script",
  );
const src = delivered.replace(CANVAS, `viewBox="${VIEWBOX}"`);

/** Replace every occurrence, and throw if there were none to replace. */
function swap(svg, from, to, what) {
  if (from === to) return svg;
  const out = svg.replaceAll(from, to);
  if (out === svg)
    throw new Error(
      `the delivered lockup carries no ${from} (${what}); the source and this ` +
        `script have diverged, so the recolour would be silent.`,
    );
  return out;
}

/** The delivered art, recoloured onto one of the site's two surfaces. */
const variant = (light, accent) =>
  swap(
    swap(src, DELIVERED_LIGHT, light, "strokes"),
    DELIVERED_ACCENT,
    accent,
    "accent",
  );

writeFileSync(
  "public/brand/yuvoy-lockup-on-dark.svg",
  variant(token("paper"), DELIVERED_ACCENT),
);
writeFileSync(
  "public/brand/yuvoy-lockup-on-light.svg",
  variant(token("forest"), token("terra-deep")),
);

console.log("wrote yuvoy-lockup-on-dark.svg and yuvoy-lockup-on-light.svg");
