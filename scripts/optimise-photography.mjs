/**
 * Turns the owner's delivered photography into the assets the site ships.
 * Never hand-edit the output; drop new source files in and re-run:
 *
 *   node scripts/optimise-photography.mjs
 *
 * Source lives in `design/photography-source/` exactly as delivered (PNG,
 * ~2MB each). Output is WebP in `public/photography/`, which is what
 * `heroMedia` points at.
 *
 * **The masters live outside `public/` on purpose.** Anything under `public/`
 * is deployed and publicly fetchable, so leaving 17MB of print-weight PNGs
 * there would ship them to every visitor's reach for no reason. They are kept
 * in the repo because re-running from them is how a quality or crop decision
 * gets revisited, and a lossy file re-encoded degrades every time somebody
 * changes their mind.
 *
 * ## Why this exists rather than "just convert them once"
 *
 * 15MB of PNG on a landing page is not a rounding error — it is the whole
 * performance budget, twice over. Each source here is a photograph, which is
 * exactly what WebP's lossy mode is for: q78 lands these under 200KB with no
 * visible difference at the sizes they render, and the optimiser still serves
 * responsive variants on top of that.
 *
 * ## The naming rule
 *
 * Delivered names carry `&` and mixed case (`Diving&water.png`). Neither
 * belongs in a URL: `&` terminates a query string, and case-sensitivity
 * differs between a mac filesystem and a Linux one, which is the classic
 * "works locally, 404s on Vercel" bug. The table below is the one place the
 * delivered name maps to the shipped slug, so a renamed delivery is a
 * one-line change here rather than a hunt through components.
 */

import { existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// sharp ships with Next (optional dependency), not with us, and pnpm's strict
// layout hides transitive packages — so load it straight from the pnpm store
// instead of adding a dependency for a build-time conversion.
const require = createRequire(import.meta.url);
const pnpmDir = join(root, "node_modules/.pnpm");
const sharpEntry = readdirSync(pnpmDir).find((d) => d.startsWith("sharp@"));
if (!sharpEntry) throw new Error("sharp not found in the pnpm store");
const sharp = require(join(pnpmDir, sharpEntry, "node_modules/sharp"));

const SRC_DIR = join(root, "design/photography-source");
const OUT_DIR = join(root, "public/photography");

/**
 * Delivered file → shipped slug, with the aspect ratio the layout depends on.
 *
 * The ratios are asserted, not assumed: a source delivered at the wrong ratio
 * would be silently cropped by `object-cover` and nobody would notice until
 * the horizon sat wrong on a phone. Failing here instead makes the delivery
 * the thing that gets fixed.
 *
 * They are the DELIVERY's ratios, not the layout's, and the two stopped
 * matching on 2026-08-18: a destination plate is now roughly 0.63 (a square
 * photograph share plus whatever the caption needs) against a 3/4 delivery,
 * so `object-cover` trims about 15% of the width. That is a crop these
 * frames carry easily and it is the right place for it — a plate's ratio
 * moves with its copy and its column, so baking the layout into the file
 * would only make the file wrong the next time the caption changed.
 */
const SOURCES = [
  { file: "Havelock.png", slug: "havelock", ratio: 3 / 4 },
  { file: "Neil.png", slug: "neil", ratio: 3 / 4 },
  { file: "Port-Blair.png", slug: "port-blair", ratio: 3 / 4 },
  { file: "Diving&water.png", slug: "diving-water", ratio: 5 / 4 },
  { file: "Boats&island.png", slug: "boats-islands", ratio: 5 / 4 },
  { file: "Food&culture.png", slug: "food-culture", ratio: 5 / 4 },
  { file: "Local&unexpected.png", slug: "local-unexpected", ratio: 5 / 4 },
];

/**
 * How far the delivered ratio may drift before it is a mistake rather than a
 * rounding difference. 1086x1448 is 0.75 exactly; 1402x1122 is 0.7996 against
 * a target of 0.8. A percent of tolerance covers real crops without letting a
 * landscape file through as a portrait one.
 */
const RATIO_TOLERANCE = 0.01;

/**
 * Long edge, in CSS pixels, of the largest slot either image type occupies.
 *
 * A destination plate is at most a third of a 1120px measure (~355px wide,
 * ~473px tall); a category strip is at most a quarter (~250px wide). At 2x
 * for retina that is ~950px on the longest edge, so 1600 leaves real headroom
 * for a future full-bleed treatment without shipping a print master. Sources
 * smaller than this are left at their own size rather than upscaled — sharp
 * would happily invent pixels, and they always look it.
 */
const MAX_EDGE = 1600;

const QUALITY = 78;

/**
 * Full-bleed backdrops, which follow different rules from a panel photograph.
 *
 * They are never cropped here. A backdrop's height is whatever its section
 * turns out to be — the footer's depends on the page, the breakpoint and
 * whether the closing call to action is shown — so the crop belongs in CSS
 * (`object-cover` plus an `object-position`), where it can respond, rather
 * than baked into a file at one guessed ratio.
 *
 * They keep more resolution than a panel does, because they stretch to the
 * viewport rather than to a third of the measure.
 */
const BACKDROPS = [
  { file: "footer-bg.png", slug: "footer", maxEdge: 2048 },
  /*
    `/contact`'s field: the moody bay the owner delivered for that page
    (2026-08-11). A backdrop like the footer's — it stretches to a section
    whose height nobody can predict, so its crop stays in CSS.

    `moody-tropical-bay-02.png` is delivered and kept as a master but ships
    nothing: it is the alternate frame of the same scene, held so a crop
    decision can be revisited without asking for the artwork again.
  */
  { file: "moody-tropical-bay-01.png", slug: "contact-bay", maxEdge: 2048 },
  /*
    The first-launch act's night field. Delivered at 1672x941, which is under
    `maxEdge` — `withoutEnlargement` leaves it there rather than inventing
    pixels, and it is enough for a field this soft.

    `rolloff` is the whole reason this entry is not a one-liner. See
    `compressHighlights` below.
  */
  {
    file: "first-launch-bg.png",
    slug: "first-launch",
    maxEdge: 2048,
    rolloff: true,
  },
];

/**
 * The knee and the ceiling of the highlight rolloff, in WCAG relative
 * luminance. `forest` sits at 0.0301, and the delivered artwork's brightest
 * passage — the moon and the sunlit island shoulder — reaches 0.226.
 *
 * The ceiling is the number that matters. `terra-soft` is 0.3548, so a
 * background at luminance L renders the eyebrow at (0.3548 + 0.05) / (L +
 * 0.05); AA at 4.5:1 needs L <= 0.0400, and a ceiling of 0.0335 leaves the
 * worst pixel in the frame at 5.82:1 — better than the 5.36:1 of the flat
 * forest it is painted over.
 */
const ROLLOFF = { knee: 0.018, ceiling: 0.0335 };

/**
 * Pulls a backdrop's highlights down to a luminance any brand text can be
 * read against, and leaves everything below the knee exactly as delivered.
 *
 * ## Why this is baked into the asset rather than layered in CSS
 *
 * A backdrop that carries type has to be safe at its BRIGHTEST pixel, not its
 * average one: `object-cover` moves the crop with the viewport and a section's
 * height moves with its copy, so there is no fixed place on the page where a
 * highlight can be assumed not to be.
 *
 * The first attempt (2026-08-17) enforced that in CSS, with a 70% `forest`
 * multiply and a 62%-plus scrim over the whole frame. It measured fine and it
 * was wrong: a multiply scales every pixel, so buying safety at the top of the
 * range cost the entire middle of it, where the artwork actually lives. The
 * palms, the shafts and the boat went to a ghost and the act read as flat
 * forest with grain on it (owner report, 2026-08-18).
 *
 * A knee compressor is the tool the multiply was standing in for. Everything
 * under `knee` passes through untouched; above it, luminance eases
 * asymptotically toward `ceiling` and never reaches it, so the specular
 * passages flatten and the midtones do not move. Channels are scaled by the
 * ratio of new luminance to old, which holds the hue — the artwork keeps its
 * colour and only loses the light it could not afford.
 *
 * The result is better on both axes at once, which is the tell that the first
 * version was solving the wrong problem: the worst pixel goes from 5.11:1 to
 * 5.82:1 against `terra-soft` **and** the field's visible tonal range roughly
 * triples.
 *
 * Working in sRGB bytes on the raw buffer, because that is what the file is;
 * luminance is WCAG's, so the number here and the number in the design system
 * are the same number.
 */
function compressHighlights({ data, info }) {
  const channel = (c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const { knee, ceiling } = ROLLOFF;
  const span = ceiling - knee;

  for (let i = 0; i < data.length; i += info.channels) {
    const luminance =
      0.2126 * channel(data[i]) +
      0.7152 * channel(data[i + 1]) +
      0.0722 * channel(data[i + 2]);
    if (luminance <= knee) continue;

    const rolled = knee + span * (1 - Math.exp(-(luminance - knee) / span));
    const scale = rolled / luminance;
    // Only the colour channels: an alpha channel, if the source has one, is
    // not light and must not be scaled with it.
    for (let c = 0; c < 3; c += 1) {
      data[i + c] = Math.min(255, Math.round(data[i + c] * scale));
    }
  }
  return { data, info };
}

/**
 * Details: a **named region** of a delivery, cut here rather than in CSS.
 *
 * This is the exception to the backdrop rule above, and it earns it by having
 * the one thing a backdrop never has — a slot whose aspect ratio is known at
 * build time. `/contact`'s note card holds a fixed band (`h-56 sm:h-64`) at a
 * card width the page measure decides, so the frame it needs is knowable, and
 * `object-position` cannot reach it anyway: at that band's ratio the whole
 * width of the source already fits, so there is no overflow left to pan
 * across. Cropping in CSS would mean shipping four times the pixels to throw
 * three of them away.
 *
 * Regions are in **source pixels** and are asserted against the delivery's own
 * dimensions before the cut. A region that has drifted off the edge of a
 * re-delivered file fails here rather than silently sliding to whatever sharp
 * clamps it to, which would move the horizon without moving the filename.
 */
const DETAILS = [
  {
    file: "moody-tropical-bay-03.png",
    slug: "contact-note",
    /*
      The right half of the bay, on the waterline: the island ridge and the
      one boat (owner direction, 2026-08-12 — the full frame put the empty
      left-hand water in the card and left the subject off the edge of it).
      ~1.8, between the band's ratio on a phone (1.53) and on a wide screen
      (2.1), so `object-cover` trims a little either way and neither end gets
      a crop it was not drawn for.
    */
    region: { left: 870, top: 390, width: 791, height: 439 },
    maxEdge: 1100,
  },
];

if (!existsSync(SRC_DIR)) {
  throw new Error(`no source directory at ${SRC_DIR}`);
}
mkdirSync(OUT_DIR, { recursive: true });

const kb = (bytes) => `${Math.round(bytes / 1024)}KB`;
let savedFrom = 0;
let savedTo = 0;

for (const { file, slug, ratio } of SOURCES) {
  const src = join(SRC_DIR, file);
  if (!existsSync(src)) {
    throw new Error(
      `missing source "${file}" in ${SRC_DIR}. Update SOURCES if it was renamed.`,
    );
  }

  const { width, height } = await sharp(src).metadata();
  const actual = width / height;
  if (Math.abs(actual - ratio) > RATIO_TOLERANCE) {
    throw new Error(
      `${file} is ${width}x${height} (ratio ${actual.toFixed(3)}), expected ~${ratio.toFixed(3)}. ` +
        `Re-crop the delivery or update SOURCES.`,
    );
  }

  const out = join(OUT_DIR, `${slug}.webp`);
  await sharp(src)
    // `withoutEnlargement` is the guard against upscaling a small delivery.
    .resize({
      width: width >= height ? MAX_EDGE : undefined,
      height: height > width ? MAX_EDGE : undefined,
      withoutEnlargement: true,
      fit: "inside",
    })
    .webp({ quality: QUALITY })
    .toFile(out);

  const from = statSync(src).size;
  const to = statSync(out).size;
  savedFrom += from;
  savedTo += to;
  console.log(`${file} → photography/${slug}.webp  ${kb(from)} → ${kb(to)}`);
}

for (const { file, slug, maxEdge, rolloff } of BACKDROPS) {
  const src = join(SRC_DIR, file);
  if (!existsSync(src)) {
    throw new Error(
      `missing backdrop "${file}" in ${SRC_DIR}. Update BACKDROPS if it was renamed.`,
    );
  }

  const out = join(OUT_DIR, `${slug}.webp`);
  const resized = sharp(src).resize({
    width: maxEdge,
    withoutEnlargement: true,
  });

  if (rolloff) {
    // Round-trip through raw so the compressor sees real pixels. It runs
    // AFTER the resize, so the ceiling is measured on the pixels that ship
    // rather than on ones the resampler is about to average away.
    const { data, info } = await resized
      .raw()
      .toBuffer({ resolveWithObject: true });
    compressHighlights({ data, info });
    await sharp(data, {
      raw: { width: info.width, height: info.height, channels: info.channels },
    })
      .webp({ quality: QUALITY })
      .toFile(out);
  } else {
    await resized.webp({ quality: QUALITY }).toFile(out);
  }

  const from = statSync(src).size;
  const to = statSync(out).size;
  savedFrom += from;
  savedTo += to;
  console.log(`${file} → photography/${slug}.webp  ${kb(from)} → ${kb(to)}`);
}

for (const { file, slug, region, maxEdge } of DETAILS) {
  const src = join(SRC_DIR, file);
  if (!existsSync(src)) {
    throw new Error(
      `missing detail source "${file}" in ${SRC_DIR}. Update DETAILS if it was renamed.`,
    );
  }

  // The region has to be inside the delivery. sharp would clamp a region that
  // hangs off the edge and hand back a differently-framed image under the same
  // filename, which is the failure nobody would look for.
  const { width, height } = await sharp(src).metadata();
  if (
    region.left + region.width > width ||
    region.top + region.height > height
  ) {
    throw new Error(
      `${file} is ${width}x${height}, too small for the region ` +
        `${region.width}x${region.height} at ${region.left},${region.top}. ` +
        `Re-cut the region in DETAILS against the new delivery.`,
    );
  }

  const out = join(OUT_DIR, `${slug}.webp`);
  await sharp(src)
    .extract(region)
    .resize({ width: maxEdge, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(out);

  const from = statSync(src).size;
  const to = statSync(out).size;
  savedFrom += from;
  savedTo += to;
  console.log(`${file} → photography/${slug}.webp  ${kb(from)} → ${kb(to)}`);
}

console.log(
  `\n${SOURCES.length + BACKDROPS.length + DETAILS.length} images: ` +
    `${kb(savedFrom)} → ${kb(savedTo)} ` +
    `(${Math.round((1 - savedTo / savedFrom) * 100)}% smaller)`,
);
