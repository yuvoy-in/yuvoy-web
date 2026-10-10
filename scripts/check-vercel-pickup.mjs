#!/usr/bin/env node
/**
 * Did Vercel pick up a push? One commit's answer, read from GitHub and, when
 * Vercel's credentials are set, from Vercel itself.
 *
 *   node scripts/check-vercel-pickup.mjs <owner/repo> <sha> [branch]
 *
 * deploy-watchdog.yml runs it on every push to `main`, waiting up to three
 * minutes for Vercel's commit status, and deploys from Actions only when it
 * answers `missing`. _deploy.yml runs it once more, with no wait, right before
 * that fallback uploads: the build takes minutes, and in that time Vercel may
 * have caught up or `main` may have moved on.
 *
 * The verdict, by the rules in vercel-pickup.mjs:
 *
 *   picked-up   Vercel has the push. Exits 0.
 *   superseded  The branch has moved past the commit. Exits 0.
 *   missing     Vercel never picked the push up and the branch still points
 *               at it. Exits 0; the caller deploys.
 *   unknown     Could not tell. Exits 1, so nothing deploys on a guess and
 *               the run shows red.
 *
 * Read-only: it never writes to GitHub or Vercel. A usage error exits 2.
 *
 * Environment:
 *
 *   GITHUB_TOKEN or GH_TOKEN   Required. Reads the commit's statuses and the
 *                              branch head.
 *   VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID
 *                              Optional. With all three, Vercel's production
 *                              deployments of the commit are read too, which
 *                              catches a push Vercel received but posted no
 *                              status for. The project is yuvoy.in's, the
 *                              VERCEL_PROJECT_ID_PROD secret in Actions.
 *   PUSHED_AT                  When the push happened: the push event's
 *                              `repository.pushed_at`. A Vercel status older
 *                              than that belongs to an earlier push of the
 *                              same commit and does not count.
 *   PICKUP_DEADLINE_S          How long to wait for the status. Default 180;
 *                              0 reads once.
 *   PICKUP_INTERVAL_S          How often to read while waiting. Default 10.
 *   VERCEL_STATUS_CONTEXT      The status's context. Default yuvoy.in's, from
 *                              vercel-pickup.mjs.
 *
 * A dry run from a laptop, which deploys nothing whatever it answers:
 *
 *   GITHUB_TOKEN=$(gh auth token) PICKUP_DEADLINE_S=0 \
 *     node scripts/check-vercel-pickup.mjs yuvoy-in/yuvoy-web <sha>
 */
import { appendFileSync } from "node:fs";
import {
  VERCEL_STATUS_CONTEXT,
  decide,
  pushedAtFrom,
  watchPickup,
} from "./vercel-pickup.mjs";

const USAGE =
  "node scripts/check-vercel-pickup.mjs <owner/repo> <sha> [branch]";

const [repo, sha, branch = "main"] = process.argv.slice(2);
if (!repo || !/^[\w.-]+\/[\w.-]+$/.test(repo)) {
  usage(`Not a repository: "${repo ?? ""}".`);
}
if (!sha || !/^[0-9a-f]{40}$/.test(sha)) {
  usage(`Not a full commit sha: "${sha ?? ""}".`);
}
if (!/^[\w.-]+(\/[\w.-]+)*$/.test(branch) || branch.includes("..")) {
  usage(`Not a branch name: "${branch}".`);
}

const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
if (!token) {
  usage("Set GITHUB_TOKEN or GH_TOKEN to a token that can read the repo.");
}

const deadlineS = seconds("PICKUP_DEADLINE_S", 180, 0);
const intervalS = seconds("PICKUP_INTERVAL_S", 10, 1);
const context =
  process.env.VERCEL_STATUS_CONTEXT?.trim() || VERCEL_STATUS_CONTEXT;
let pushedAtMs = null;
try {
  pushedAtMs = pushedAtFrom(process.env.PUSHED_AT);
} catch (err) {
  usage(`PUSHED_AT: ${err.message}`);
}
const short = sha.slice(0, 7);

console.log(
  deadlineS > 0
    ? `Waiting up to ${deadlineS}s for Vercel's status on ${short}.`
    : `Reading Vercel's status on ${short}.`,
);

const watched = await watchPickup({
  readStatuses: () =>
    attempt(() => github(`/commits/${sha}/statuses?per_page=100`)),
  context,
  pushedAtMs,
  deadlineMs: deadlineS * 1000,
  intervalMs: intervalS * 1000,
});

// Only asked when the status never came: a status settles it on its own.
const [vercel, head] = watched.statusSeen
  ? [undefined, undefined]
  : await Promise.all([readVercel(), readHead()]);

const { verdict, why } = decide({ sha, branch, watched, vercel, head });
report(verdict, why);
process.exitCode = verdict === "unknown" ? 1 : 0;

async function readVercel() {
  const { VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID } = process.env;
  if (!VERCEL_TOKEN || !VERCEL_ORG_ID || !VERCEL_PROJECT_ID) {
    return { ok: false };
  }
  const query = new URLSearchParams({
    projectId: VERCEL_PROJECT_ID,
    sha,
    target: "production",
    limit: "20",
  });
  // A personal account's id is not a team, and the API refuses it as one.
  if (VERCEL_ORG_ID.startsWith("team_")) query.set("teamId", VERCEL_ORG_ID);
  try {
    const body = await attempt(() =>
      getJson(`https://api.vercel.com/v6/deployments?${query}`, {
        authorization: `Bearer ${VERCEL_TOKEN}`,
        "user-agent": "yuvoy-deploy-watchdog",
      }),
    );
    if (!Array.isArray(body?.deployments)) {
      throw new Error("api.vercel.com answered without a deployments list");
    }
    return { ok: true, deployments: body.deployments };
  } catch (error) {
    return { ok: false, error };
  }
}

async function readHead() {
  const ref = branch.split("/").map(encodeURIComponent).join("/");
  try {
    const answer = await attempt(() => github(`/git/ref/heads/${ref}`));
    const headSha = answer?.object?.sha;
    if (typeof headSha !== "string" || !/^[0-9a-f]{40}$/.test(headSha)) {
      throw new Error(`the refs API answered without a commit for ${branch}`);
    }
    return { ok: true, sha: headSha };
  } catch (error) {
    return { ok: false, error };
  }
}

function github(endpoint) {
  return getJson(`https://api.github.com/repos/${repo}${endpoint}`, {
    accept: "application/vnd.github+json",
    authorization: `Bearer ${token}`,
    "x-github-api-version": "2022-11-28",
    "user-agent": "yuvoy-deploy-watchdog",
  });
}

async function getJson(url, headers) {
  const res = await fetch(url, {
    headers,
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`${new URL(url).host} answered ${res.status}`);
  return res.json();
}

/** Every read gets three tries: one 502 must not decide a deploy. */
async function attempt(read, tries = 3) {
  for (let i = 1; ; i += 1) {
    try {
      return await read();
    } catch (err) {
      if (i >= tries) throw err;
      await new Promise((resolve) => setTimeout(resolve, 2_000));
    }
  }
}

function report(verdict, why) {
  const fine = verdict === "picked-up" || verdict === "superseded";
  if (process.env.GITHUB_ACTIONS === "true") {
    const level = fine ? "notice" : verdict === "missing" ? "warning" : "error";
    console.log(
      `::${level} title=Vercel pickup of ${short}::${escape(`${verdict}. ${why}`)}`,
    );
  } else {
    console.log(`\n${fine ? "✓" : "✗"} ${verdict}: ${why}\n`);
  }
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `verdict=${verdict}\n`);
  }
  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(
      process.env.GITHUB_STEP_SUMMARY,
      `**Vercel pickup of ${short}: ${verdict}.** ${why}\n`,
    );
  }
}

/** What a workflow command's message must escape to arrive in one piece. */
function escape(text) {
  return text.replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");
}

function seconds(name, fallback, min) {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === "") return fallback;
  const value = Number(raw);
  if (!Number.isFinite(value) || value < min) {
    usage(`${name} must be a number of seconds, at least ${min}: "${raw}".`);
  }
  return value;
}

function usage(message) {
  console.error(`\n✗ ${message}\n\n  ${USAGE}\n`);
  process.exit(2);
}
