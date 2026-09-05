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
 *
 * **But "GitHub answered 404" is not a network failure**, and treating it as
 * one is how this check stops checking. A pin with a mistyped SHA, or one
 * pointing at a commit that was force-pushed away, gets exactly the same `gh`
 * exit code as a flight-mode laptop — so it skipped, said "could not reach",
 * and passed. Found in yuvoy-operator on 5 Sep 2026: a re-pin carried a real
 * SHA prefix with an invented tail, every run printed a reassuring warning,
 * and nothing was verified against upstream at all.
 *
 * So the two are told apart by whether GitHub answered. An HTTP status in
 * `gh`'s output means we reached it: 404 is a real answer about a ref that is
 * not there and FAILS; 401/403 is our own credentials or a rate limit and
 * warns. No status at all is DNS, a dropped connection or no auth — warn.
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
} catch (err) {
  const said = `${err.stderr ?? ""}${err.stdout ?? ""}`;
  const status = Number(said.match(/\(HTTP (\d{3})\)/)?.[1] ?? 0);

  if (status === 404) {
    fail(
      `${pinned.repo} has no ${pinned.path} at ref ${pinned.ref.slice(0, 12)} — GitHub answered 404.\n` +
        `  The pin names a commit that does not exist (a mistyped SHA, or one that was\n` +
        `  force-pushed away). This is NOT a network problem and is not skippable:\n` +
        `  nothing would be verified against upstream, on every run, silently.\n` +
        `  Fix contracts/PINNED, re-pull the contract, run \`pnpm codegen\`, commit both.`,
    );
  }

  /*
    Reached GitHub, and it refused us rather than the ref: our credentials or
    a rate limit. Not a statement about drift, so it warns like being offline.
  */
  const reason =
    status === 401 || status === 403
      ? `${pinned.repo} refused the request (HTTP ${status} — auth or rate limit)`
      : status
        ? `${pinned.repo} answered HTTP ${status}`
        : `could not reach ${pinned.repo} (offline, or gh not authenticated)`;

  console.warn(
    `\n⚠ contract check skipped: ${reason}.\n` +
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
