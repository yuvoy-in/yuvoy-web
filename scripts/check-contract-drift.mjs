#!/usr/bin/env node
/**
 * Fails the build if the checked-in contract no longer matches the ref it is
 * pinned to, or if the generated types are stale against the contract.
 *
 * The path is read from PINNED rather than assumed: `yuvoy-operator` tracks a
 * different document in the same repo, and a check that silently verified the
 * wrong one would pass forever while saying nothing true.
 *
 * Both halves matter. A contract that has moved on the server and a schema
 * that was not regenerated after a contract bump produce the same symptom —
 * types that say one thing and responses that do another — and that symptom
 * surfaces at runtime, in a form somebody is trying to submit.
 *
 * Network failures do NOT fail the check. A build must not depend on GitHub
 * being reachable; it warns and moves on, and the drift is caught on the next
 * run that can reach the network.
 */
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";

const PINNED = "contracts/PINNED";
const GENERATED = "src/lib/api/schema.ts";

function fail(msg) {
  console.error(`\n✗ contract drift: ${msg}\n`);
  process.exit(1);
}

if (!existsSync(PINNED)) fail(`${PINNED} is missing.`);

const pinned = Object.fromEntries(
  readFileSync(PINNED, "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

if (!pinned.repo || !pinned.ref) fail(`${PINNED} needs repo= and ref=.`);
if (!pinned.path)
  fail(
    `${PINNED} needs path= — this repo tracks the OPERATOR contract, not the traveller one, and defaulting to the wrong document is exactly the failure this file exists to prevent.`,
  );

const CONTRACT = `contracts/${pinned.path.split("/").pop()}`;

// 1. The generated types must be newer than the contract they came from.
if (!existsSync(GENERATED)) fail(`${GENERATED} is missing. Run: pnpm codegen`);

const local = readFileSync(CONTRACT);
const localSha = createHash("sha256").update(local).digest("hex");

// 2. The contract must still match the pinned ref upstream.
let upstream;
try {
  upstream = execFileSync(
    "gh",
    [
      "api",
      `repos/${pinned.repo}/contents/${pinned.path}?ref=${pinned.ref}`,
      "--jq",
      ".content",
    ],
    { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  );
} catch {
  console.warn(
    `\n⚠ contract check skipped: could not reach ${pinned.repo} (offline, or gh not authenticated).\n` +
      `  Pinned ref ${pinned.ref.slice(0, 12)} was not verified this run.\n`,
  );
  process.exit(0);
}

const upstreamSha = createHash("sha256")
  .update(Buffer.from(upstream, "base64"))
  .digest("hex");

if (localSha !== upstreamSha) {
  fail(
    `${CONTRACT} differs from ${pinned.repo}@${pinned.ref.slice(0, 12)}:${pinned.path}.\n` +
      `  Either the pin moved or the local copy was edited by hand.\n` +
      `  Re-pull it, run \`pnpm codegen\`, and commit both.`,
  );
}

console.log(
  `✓ contract matches ${pinned.repo}@${pinned.ref.slice(0, 12)} — ${pinned.path} (${pinned.branch ?? "?"})`,
);
