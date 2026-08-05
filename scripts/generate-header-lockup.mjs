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
const src = readFileSync(SRC, "utf8");

writeFileSync("public/brand/yuvoy-lockup-on-dark.svg", src);

const light = src
  .replaceAll("#F4EFE4", "#16362E")
  .replaceAll("#D79772", "#985028");
if (light === src) throw new Error("source fills changed; update this script");
writeFileSync("public/brand/yuvoy-lockup-on-light.svg", light);

console.log("wrote yuvoy-lockup-on-dark.svg and yuvoy-lockup-on-light.svg");
