#!/usr/bin/env node
/**
 * Fails when a long dash appears in copy a user can read.
 *
 * Long dashes read as AI-generated filler, so the product does not use them.
 * Owner direction 2026-09-12, and `docs/DESIGN_SYSTEM.md` has said the same
 * since 2026-08-03. Use a comma, a colon, a full stop, parentheses, or a
 * middot for a pairing. This check is why the rule stopped being advice: it
 * was written down for five weeks and broken in 241 places anyway.
 *
 * Scope is RENDERED COPY: files under `src/` that can put text on a screen,
 * with comments blanked out first. Comments, `docs/`, the pinned contracts
 * and the generated schema are out of scope, which is what the design system
 * says. Widening this to comments is a separate decision and a much larger
 * sweep; do not widen it without also cleaning them, or every build fails.
 *
 * Text arriving from the API is not covered here, because we do not write it.
 * That is stripped at the boundary instead, in `src/lib/format/dedash.ts`.
 *
 * An EN dash counts too, and a range takes a plain hyphen ("10-11", "0-100",
 * "Name A-Z"). Owner direction 2026-09-12 widened this from the em dash alone.
 *
 * Usage:
 *   node scripts/check-no-em-dashes.mjs            # all rendered copy
 *   node scripts/check-no-em-dashes.mjs <files...> # the given files only
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
// Written as escapes so this file does not trip its own check.
const EM_DASH = "\u2014";
const HORIZONTAL_BAR = "\u2015";
const EN_DASH = "\u2013";
const NAMES = {
  [EM_DASH]: "em dash",
  [EN_DASH]: "en dash",
  [HORIZONTAL_BAR]: "horizontal bar",
};
const PATTERN = new RegExp(`[${EM_DASH}${EN_DASH}${HORIZONTAL_BAR}]`, "g");

/** A file that can render text. */
const RENDERS = /\.tsx?$/;
/** Generated, or a test rather than a screen. */
const SKIP = /\.gen\.ts$|[/\\]schema\.ts$|\.(test|spec)\.tsx?$/;

function walk(dir, acc = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path, acc);
    else if (RENDERS.test(entry.name) && !SKIP.test(path)) acc.push(path);
  }
  return acc;
}

/**
 * Blank out comments WITHOUT moving any line, so a finding's line number
 * still points at the real line. The `[^:]` guard keeps "https://" intact.
 */
const stripComments = (src) =>
  src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(
      /(^|[^:])\/\/.*$/gm,
      (m, p) => p + " ".repeat(m.length - p.length),
    );

function targets() {
  const given = process.argv.slice(2);
  if (given.length)
    return given.filter((f) => RENDERS.test(f) && !SKIP.test(f));
  const src = join(ROOT, "src");
  return existsSync(src) ? walk(src) : [];
}

const findings = [];
for (const file of targets()) {
  let text;
  try {
    if (statSync(file).isDirectory()) continue;
    text = readFileSync(file, "utf8");
  } catch {
    continue;
  }
  if (!PATTERN.test(text)) continue;
  PATTERN.lastIndex = 0;

  stripComments(text)
    .split("\n")
    .forEach((line, index) => {
      for (const match of line.matchAll(PATTERN)) {
        findings.push({
          file: relative(ROOT, file),
          line: index + 1,
          name: NAMES[match[0]],
          text: line.trim(),
        });
      }
    });
}

if (findings.length) {
  const plural = findings.length === 1 ? "" : "es";
  console.error(
    `\n${findings.length} em dash${plural} in rendered copy. Use a comma, a colon, a full stop, parentheses, or a middot for a pairing.\n`,
  );
  for (const f of findings) {
    console.error(`  ${f.file}:${f.line}  (${f.name})\n    ${f.text}`);
  }
  console.error("");
  process.exit(1);
}

console.log("no long dashes in rendered copy");
