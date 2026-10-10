/**
 * The rules `check-vercel-pickup.mjs` uses to decide whether Vercel picked up
 * a push, kept apart from the network calls so they can be tested without
 * GitHub or Vercel (src/app/vercel-pickup.test.ts).
 *
 * Why it exists: on 10 Oct 2026 yuvoy-app's release #174 merged to `main` and
 * Vercel's Git integration never saw the push. No commit status, no
 * deployment, no retry, both status pages green, and app.yuvoy.in kept
 * serving the previous release for hours. yuvoy.in deploys the same way.
 * GitHub hands pushes to Vercel only through the Vercel GitHub App, whose
 * delivery log only Vercel can read, and a lost delivery is never retried.
 * The loss cannot be prevented from this side; deploy-watchdog.yml notices it
 * and deploys from Actions instead. Ported from yuvoy-app (11 Oct 2026).
 *
 * The signal is the commit status Vercel posts for yuvoy.in's project
 * (VERCEL_STATUS_CONTEXT below), creator `vercel[bot]`, within seconds of
 * every push Vercel receives, while the build is still queued. Any state
 * counts, failure included, and so does a production deployment of the
 * commit in any state. Either means Vercel SAW the push, and a build Vercel
 * ran and failed, or that somebody cancelled, is a decision to look at, not a
 * lost push to paper over with a second build. A status older than the push
 * does not count: the same commit pushed to `dev` first carries a preview's
 * status, which says nothing about `main`.
 *
 * Deploying an OLDER commit over a newer one is the mistake that matters most,
 * so nothing here answers `missing` unless the branch is known to still point
 * at the commit. A push of several commits is watched for its head only,
 * which is also the only one Vercel deploys.
 */

/**
 * The context Vercel's Git integration posts yuvoy.in's commit status under.
 * This repo has two Vercel projects and each posts its own status: `Vercel`,
 * an en dash, then the project's name, `yuvoy-web` for yuvoy.in and
 * `staging-yuvoy-web` for staging. Written as an escape because the dash
 * itself is banned from this repo's text. Renaming the project renames the
 * context, so change this with it; until then the watchdog waits out its
 * three minutes and finds Vercel's production deployment of the push instead.
 */
export const VERCEL_STATUS_CONTEXT = "Vercel \u2013 yuvoy-web";

/**
 * How much older than the push a status may be and still count. Vercel
 * always posts after the push; the slack only absorbs GitHub stamping the
 * push in whole seconds.
 */
export const PUSH_SLACK_MS = 30_000;

/**
 * When the push happened, in milliseconds, from what the push event carries
 * as `repository.pushed_at`: whole seconds since the epoch, or an ISO date.
 * Nothing given is `null`, and then a status of any age counts. Anything else
 * throws, since a garbled time would quietly discount every status.
 */
export function pushedAtFrom(raw) {
  if (raw === undefined || raw === null || String(raw).trim() === "") {
    return null;
  }
  const text = String(raw).trim();
  if (/^\d+$/.test(text)) return Number(text) * 1000;
  const ms = Date.parse(text);
  if (!Number.isFinite(ms)) throw new Error(`Not a push time: ${text}`);
  return ms;
}

/**
 * Whether `status`, one entry of GitHub's commit statuses API, is the one
 * Vercel posts when it receives a push. A status somebody else posts under
 * the same name does not count, nor does another of Vercel's contexts, nor,
 * when the push time is known, one posted for an earlier push. `pushedAtMs`
 * is that time, and leaving it out lets a status of any age count.
 */
export function isVercelStatus(
  status,
  context = VERCEL_STATUS_CONTEXT,
  pushedAtMs,
) {
  if (status?.creator?.login !== "vercel[bot]") return false;
  if (status?.context !== context) return false;
  if (pushedAtMs === null || pushedAtMs === undefined) return true;
  const created = Date.parse(status.created_at);
  return Number.isFinite(created) && created >= pushedAtMs - PUSH_SLACK_MS;
}

/**
 * The production deployments of `sha` in Vercel's deployments list, in any
 * state. Strict about the rest: a preview of the same commit, or a production
 * deployment of another one, says nothing about this push. A CLI deployment
 * carries no commit at all, so a fallback deploy never counts as Vercel's.
 */
export function deploymentsOf(deployments, sha) {
  return (deployments ?? []).filter(
    (d) => d?.meta?.githubCommitSha === sha && d?.target === "production",
  );
}

/**
 * Reads the commit's statuses until Vercel's appears or `deadlineMs` passes:
 * once straight away, then every `intervalMs`, never sleeping past the
 * deadline, so a deadline of 0 is a single read. A failed read is remembered
 * and the watch carries on.
 *
 * `options` is `{ readStatuses, deadlineMs, intervalMs }`, plus `context`,
 * `pushedAtMs`, `now` and `sleep`, which may be left out.
 */
export async function watchPickup(options) {
  const { readStatuses, deadlineMs, intervalMs } = options;
  const context = options.context ?? VERCEL_STATUS_CONTEXT;
  const pushedAtMs = options.pushedAtMs ?? null;
  const now = options.now ?? Date.now;
  const sleep =
    options.sleep ??
    ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
  const start = now();
  let reads = 0;
  let githubReadOk = false;
  let lastError = null;

  for (;;) {
    reads += 1;
    try {
      const statuses = await readStatuses();
      if (!Array.isArray(statuses)) {
        throw new Error("the statuses API answered without a list");
      }
      githubReadOk = true;
      const status = statuses.find((s) =>
        isVercelStatus(s, context, pushedAtMs),
      );
      if (status) {
        return {
          statusSeen: true,
          status,
          githubReadOk,
          lastError,
          reads,
          waitedMs: now() - start,
        };
      }
    } catch (err) {
      lastError = err;
    }
    if (now() - start + intervalMs > deadlineMs) break;
    await sleep(intervalMs);
  }

  return {
    statusSeen: false,
    status: null,
    githubReadOk,
    lastError,
    reads,
    waitedMs: now() - start,
  };
}

/**
 * The verdict, first match wins:
 *
 *   picked-up   Vercel posted its status for the push, or has a production
 *               deployment of the commit.
 *   superseded  The branch has moved past the commit. Deploying it now would
 *               roll production back; the newer push is watched on its own.
 *   unknown     The branch head could not be read, or neither GitHub nor
 *               Vercel could be. Never treated as `missing`.
 *   missing     Vercel never picked the push up, and the branch still points
 *               at it.
 *
 * `input` is `{ sha, branch, watched, vercel, head }`. `watched` is what
 * watchPickup returned. `vercel` is `{ ok: true, deployments }` after a read,
 * `{ ok: false, error }` after a failed one and `{ ok: false }` (or nothing)
 * when it was not consulted. `head` is `{ ok: true, sha }` or `{ ok: false,
 * error }`, and a head nobody read counts as unreadable.
 */
export function decide(input) {
  const { sha, branch, watched } = input;
  const vercel = input.vercel ?? { ok: false };
  const head = input.head ?? { ok: false };
  const short = sha.slice(0, 7);

  if (watched.statusSeen) {
    return {
      verdict: "picked-up",
      why: `Vercel posted its status on ${short} (${watched.status.state}).`,
    };
  }

  const seen = vercel.ok ? deploymentsOf(vercel.deployments, sha) : [];
  if (seen.length > 0) {
    const d = seen[0];
    const state = String(d.readyState ?? d.state ?? "unknown").toLowerCase();
    return {
      verdict: "picked-up",
      why: `Vercel has a production deployment of ${short} (${d.uid ?? d.id}, ${state}) but posted no status for this push.`,
    };
  }

  if (head.ok && head.sha !== sha) {
    return {
      verdict: "superseded",
      why: `${branch} has moved on to ${String(head.sha).slice(0, 7)}, so that push decides what deploys.`,
    };
  }

  if (!head.ok) {
    return {
      verdict: "unknown",
      why: `Could not read the head of ${branch} (${reason(head.error)}). Deploying ${short} blind could roll production back.`,
    };
  }

  if (!watched.githubReadOk && !vercel.ok) {
    return {
      verdict: "unknown",
      why: `Could not read the statuses of ${short} (${reason(watched.lastError)}) or Vercel's deployments, so whether Vercel has it is not known.`,
    };
  }

  const seconds = Math.round(watched.waitedMs / 1000);
  const onVercel = vercel.ok
    ? "no production deployment of it on Vercel"
    : vercel.error
      ? `Vercel's deployments unreadable (${reason(vercel.error)})`
      : "Vercel's deployments not consulted";
  return {
    verdict: "missing",
    why: `No Vercel status for this push of ${short} after ${seconds}s, ${onVercel}, and ${branch} still points at it.`,
  };
}

function reason(err) {
  if (!err) return "no detail";
  return err.message ?? String(err);
}
