/**
 * Derives the why act's background line-drawing from the owner's delivered
 * artwork (`design/brand-source/without-yuvoy-artwork.png`). Never hand-edit
 * the output; change this script and re-run it:
 *
 *   node scripts/generate-without-yuvoy-artwork.mjs
 *
 * ## Why it is not just converted to WebP
 *
 * The delivered file is warm line work on its own near-cream ground
 * (`#f9efe2`), and the page's canvas is `cream` (`#f4efe4`). Those are close
 * enough to look like a mistake and far enough apart to show a hard rectangle
 * where the image ends. `mix-blend-multiply` is the usual escape and is wrong
 * here too: multiplying a NON-white ground darkens everything under it, which
 * turned the whole section to `#eee0ca`.
 *
 * So the ground is removed instead. The drawing's own luminance becomes the
 * ALPHA channel — dark ink opaque, ground fully transparent, every
 * intermediate tone preserved — and the visible colour is painted by a solid
 * `terra` fill behind that mask. The result composites onto any surface with
 * no seam and no colour shift, and it carries a brand token rather than
 * whatever hue the source happened to be drawn in. Same alpha-stencil idea as
 * the intro veil's particle swells.
 *
 * Output is WebP with alpha: the drawing is sparse, so most of the frame
 * costs nothing once the ground is gone.
 */

import { createRequire } from "node:module";
import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// sharp ships with Next (optional dependency), not with us, and pnpm's strict
// layout hides transitive packages — so load it from the store, exactly as
// generate-intro-scene.mjs does.
const require = createRequire(import.meta.url);
const pnpmDir = join(root, "node_modules/.pnpm");
const sharpEntry = readdirSync(pnpmDir).find((d) => d.startsWith("sharp@"));
if (!sharpEntry) throw new Error("sharp not found in the pnpm store");
const sharp = require(join(pnpmDir, sharpEntry, "node_modules/sharp"));

const SRC = join(root, "design/brand-source/without-yuvoy-artwork.png");
const OUT = join(root, "public/assets/without-yuvoy-artwork.webp");

/** `--color-terra` in globals.css. A literal because a script cannot read CSS. */
const TERRA = { r: 0xbe, g: 0x71, b: 0x49 };

const { width, height } = await sharp(SRC).metadata();
if (!width || !height) throw new Error("could not read the artwork's size");

/*
  The alpha stencil, computed per pixel rather than with a filter chain.

  The delivered drawing occupies a very narrow band — measured luminance 189
  to 255, with 72% of the frame sitting in the top sixteenth. A plain
  `negate()` maps that to alpha 0-66 and the drawing all but disappears; the
  first attempt at this produced a stencil with 0.0% of its pixels above the
  visibility threshold. So the range is stretched explicitly: the measured
  ground becomes fully transparent, the darkest ink becomes fully opaque, and
  every tone between keeps its relative weight.

  Both ends are MEASURED from the file rather than typed in, because guessing
  either one fails loudly and in opposite directions: a white point set too
  high left the ground at ~5% alpha and painted a faint terra rectangle across
  the section, and one set too low made 99.8% of the frame opaque. The ground
  is by definition the most common tone in a line drawing, so the histogram's
  mode is the white point; the darkest pixel present is the black point. A
  re-delivered artwork recalibrates itself.
*/
const { data: rgb, info } = await sharp(SRC)
  .removeAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const lum = new Float32Array(width * height);
const histogram = new Uint32Array(256);
let darkest = 255;
for (let p = 0, i = 0; i < rgb.length; i += info.channels, p++) {
  const l = 0.299 * rgb[i] + 0.587 * rgb[i + 1] + 0.114 * rgb[i + 2];
  lum[p] = l;
  histogram[Math.round(l)]++;
  if (l < darkest) darkest = l;
}

let mode = 0;
for (let v = 1; v < 256; v++) if (histogram[v] > histogram[mode]) mode = v;

// One level below the mode, so the ground's own dithering clamps to zero
// rather than leaving a wash — which is the seam this file exists to avoid.
const WHITE = mode - 1;
const BLACK = Math.floor(darkest);
const span = WHITE - BLACK;
if (span < 8) {
  throw new Error(
    `artwork has almost no tonal range (white ${WHITE}, black ${BLACK}) — ` +
      `check the delivered file is line art on a flat ground`,
  );
}

const alpha = Buffer.allocUnsafe(width * height);
for (let p = 0; p < lum.length; p++) {
  const t = (WHITE - lum[p]) / span;
  alpha[p] = t <= 0 ? 0 : t >= 1 ? 255 : Math.round(t * 255);
}

const stencil = await sharp({
  create: {
    width,
    height,
    channels: 3,
    background: TERRA,
  },
})
  .joinChannel(alpha, { raw: { width, height, channels: 1 } })
  // The drawing is laid behind type at low opacity and is never the subject,
  // so the alpha channel carries the detail and the colour plane is flat terra
  // — there is nothing for a high colour quality to preserve.
  .webp({ quality: 70, effort: 6, alphaQuality: 72 })
  .toFile(OUT);

console.log(
  `${OUT.replace(root + "/", "")}: ${stencil.width}x${stencil.height}, ` +
    `${(stencil.size / 1024).toFixed(0)}KB — white ${WHITE}, black ${BLACK}`,
);
