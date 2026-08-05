/**
 * Derives the intro veil's horizon band from the owner's composite
 * `public/assets/intro.png` (full veil comp with the lockup baked in).
 * Never hand-edit the output; change this script and re-run it:
 *
 *   node scripts/generate-intro-scene.mjs
 *
 * The crop takes only the island silhouettes and the moonlit water between
 * the baked lockup's swash (above) and the baked "ANDAMAN ISLANDS" line
 * (below), so no baked type can ever double with the veil's live lockup.
 * Output is WebP: photographic content, a fraction of the PNG's weight.
 */

import { readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// sharp ships with Next (optional dependency), not with us, and pnpm's
// strict layout hides transitive packages — so load it straight from the
// pnpm store instead of adding a dependency for one build-time crop.
const require = createRequire(import.meta.url);
const pnpmDir = join(root, "node_modules/.pnpm");
const sharpEntry = readdirSync(pnpmDir).find((d) => d.startsWith("sharp@"));
if (!sharpEntry) throw new Error("sharp not found in the pnpm store");
const sharp = require(join(pnpmDir, sharpEntry, "node_modules/sharp"));
const SRC = join(root, "public/assets/intro.png");
const OUT = join(root, "public/assets/intro-horizon.webp");

// Measured off the 1672x941 comp: the swash bottoms out near y 640; the
// band below it runs to the comp's bottom edge (owner direction: the
// complete bottom of the comp, not a sliver). The comp's baked
// "ANDAMAN ISLANDS" (x ~728-952, y ~865-880, on the glint) is erased with
// a vertically mirrored strip of the water directly above it — a mirror
// stays seamless on a reflection — because the veil renders its own live
// place line in the same spot.
const BAND_TOP = 645;
const LABEL = { left: 700, top: 855, width: 280, height: 36 };

const { width, height } = await sharp(SRC).metadata();
if (width !== 1672 || height !== 941) {
  throw new Error(
    `comp is ${width}x${height}, not the measured 1672x941; re-measure the band`,
  );
}

const band = await sharp(SRC)
  .extract({ left: 0, top: BAND_TOP, width, height: height - BAND_TOP })
  .toBuffer();
const waterPatch = await sharp(band)
  .extract({
    left: LABEL.left,
    top: LABEL.top - BAND_TOP - LABEL.height,
    width: LABEL.width,
    height: LABEL.height,
  })
  .flip()
  .toBuffer();
await sharp(band)
  .composite([
    { input: waterPatch, left: LABEL.left, top: LABEL.top - BAND_TOP },
  ])
  .webp({ quality: 82 })
  .toFile(OUT);
console.log(`wrote ${OUT}`);
