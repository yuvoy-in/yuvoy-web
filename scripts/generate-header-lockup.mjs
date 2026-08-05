/**
 * Derives the two surface variants of the horizontal header lockup from the
 * owner-delivered source (2026-08-06). Never hand-edit the outputs — change
 * the source and re-run: node scripts/generate-header-lockup.mjs
 *
 * The source is drawn for forest surfaces: cream strokes (#F4EFE4) with
 * terra-soft accents (#D79772). The light variant swaps both onto the
 * cream-surface pairings from DESIGN_SYSTEM §1 — forest strokes, terra-deep
 * accents — because cream artwork is invisible on the cream bar and
 * terra-soft is not the accent that belongs on it.
 */
import { readFileSync, writeFileSync } from "node:fs";

const SRC = "public/brand/Yuvoy_Horizontal_Header_Lockup_Transparent.svg";

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

writeFileSync("public/brand/yuvoy-lockup-on-dark.svg", src);

const light = src
  .replaceAll("#F4EFE4", "#16362E")
  .replaceAll("#D79772", "#985028");
if (light === src) throw new Error("source fills changed; update this script");
writeFileSync("public/brand/yuvoy-lockup-on-light.svg", light);

console.log("wrote yuvoy-lockup-on-dark.svg and yuvoy-lockup-on-light.svg");
