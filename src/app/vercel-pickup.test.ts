import { describe, it, expect } from "vitest";
import {
  PUSH_SLACK_MS,
  VERCEL_STATUS_CONTEXT,
  decide,
  deploymentsOf,
  isVercelStatus,
  pushedAtFrom,
  watchPickup,
} from "../../scripts/vercel-pickup.mjs";

/**
 * The rules deploy-watchdog.yml deploys production by, tested without GitHub
 * or Vercel.
 *
 * On 10 Oct 2026 yuvoy-app's release #174 merged to `main` and Vercel's Git
 * integration never saw the push: no status, no deployment, and app.yuvoy.in
 * served the release before it for hours. yuvoy.in deploys the same way, and
 * the watchdog deploys such a push from Actions.
 * Two mistakes would cost more than the outage it exists for, and these pin
 * both shut: deploying a push Vercel DID pick up, which races Vercel's own
 * build for the domain, and deploying a commit `main` has moved past, which
 * rolls production back. The second is checked over every combination of
 * answers at the end.
 */

const SHA = "d5a45715facd81aec9b6319aa113568792d28fa5";
const NEWER = "0123456789abcdef0123456789abcdef01234567";
const PUSHED_AT = Date.parse("2026-10-10T13:40:00Z");

/** The status Vercel posts for yuvoy.in within seconds of a push. */
function vercelStatus(state: string, created_at = "2026-10-10T13:40:04Z") {
  return {
    context: VERCEL_STATUS_CONTEXT,
    state,
    created_at,
    creator: { login: "vercel[bot]" },
  };
}

/** A clock the watch sleeps on without anybody waiting. */
function clock() {
  let t = 0;
  const sleeps: number[] = [];
  return {
    now: () => t,
    sleep: async (ms: number) => {
      sleeps.push(ms);
      t += ms;
    },
    sleeps,
  };
}

/**
 * Answers one read each, in order, then repeats the last. An Error is thrown,
 * as a failed request would be.
 */
function reader(...answers: unknown[]) {
  let read = 0;
  return async () => {
    const answer = answers[Math.min(read, answers.length - 1)];
    read += 1;
    if (answer instanceof Error) throw answer;
    return answer;
  };
}

function production(sha: string, readyState = "READY") {
  return {
    uid: `dpl_${readyState.toLowerCase()}`,
    target: "production",
    readyState,
    meta: { githubCommitSha: sha },
  };
}

/** What watchPickup returns after three minutes of Vercel saying nothing. */
const UNSEEN = {
  statusSeen: false,
  status: null,
  githubReadOk: true,
  lastError: null,
  reads: 19,
  waitedMs: 180_000,
};
const UNREAD = {
  ...UNSEEN,
  githubReadOk: false,
  lastError: new Error("api.github.com answered 502"),
};
const SEEN = {
  ...UNSEEN,
  statusSeen: true,
  status: vercelStatus("pending"),
  reads: 1,
  waitedMs: 0,
};
const STILL_MAIN = { ok: true, sha: SHA };
const MOVED_ON = { ok: true, sha: NEWER };
const NO_HEAD = { ok: false, error: new Error("api.github.com answered 502") };
const NOTHING_ON_VERCEL = { ok: true, deployments: [] };

describe("pushedAtFrom", () => {
  it("reads the whole seconds a push event carries", () => {
    expect(pushedAtFrom("1760103600")).toBe(1760103600 * 1000);
    expect(pushedAtFrom(1760103600)).toBe(1760103600 * 1000);
  });

  it("reads an ISO date", () => {
    expect(pushedAtFrom("2026-10-10T13:40:00Z")).toBe(PUSHED_AT);
  });

  it("answers null when no time was given, so a status of any age counts", () => {
    for (const raw of [undefined, null, "", "  "]) {
      expect(pushedAtFrom(raw)).toBeNull();
    }
  });

  it("refuses a garbled time rather than discount every status", () => {
    expect(() => pushedAtFrom("yesterday")).toThrow(/Not a push time/);
  });
});

describe("isVercelStatus", () => {
  it("accepts the status Vercel posts for a push, in any state", () => {
    for (const state of ["pending", "success", "failure", "error"]) {
      expect(isVercelStatus(vercelStatus(state))).toBe(true);
    }
  });

  it("refuses anybody else's status, and Vercel's other contexts", () => {
    const status = vercelStatus("success");
    expect(
      isVercelStatus({
        ...status,
        context: "build",
        creator: { login: "github-actions[bot]" },
      }),
    ).toBe(false);
    expect(
      isVercelStatus({ ...status, context: "Vercel Preview Comments" }),
    ).toBe(false);
    expect(isVercelStatus({ ...status, creator: { login: "somebody" } })).toBe(
      false,
    );
    expect(isVercelStatus({ ...status, creator: undefined })).toBe(false);
    expect(isVercelStatus(undefined)).toBe(false);
  });

  it("matches the context it is asked for", () => {
    const status = { ...vercelStatus("success"), context: "Vercel staging" };
    expect(isVercelStatus(status, "Vercel staging")).toBe(true);
    expect(isVercelStatus(status)).toBe(false);
  });

  it("refuses a status older than the push, beyond the slack", () => {
    // The same commit pushed to `dev` first carries a preview's status.
    const earlier = new Date(PUSHED_AT - PUSH_SLACK_MS - 1_000).toISOString();
    expect(
      isVercelStatus(
        vercelStatus("success", earlier),
        VERCEL_STATUS_CONTEXT,
        PUSHED_AT,
      ),
    ).toBe(false);
  });

  it("accepts one posted after the push, or within the slack of it", () => {
    const close = new Date(PUSHED_AT - PUSH_SLACK_MS + 1_000).toISOString();
    expect(
      isVercelStatus(
        vercelStatus("pending", close),
        VERCEL_STATUS_CONTEXT,
        PUSHED_AT,
      ),
    ).toBe(true);
    expect(
      isVercelStatus(vercelStatus("pending"), VERCEL_STATUS_CONTEXT, PUSHED_AT),
    ).toBe(true);
  });

  it("refuses a status with no time once the push time is known", () => {
    const status = { ...vercelStatus("pending"), created_at: undefined };
    expect(isVercelStatus(status, VERCEL_STATUS_CONTEXT, PUSHED_AT)).toBe(
      false,
    );
    expect(isVercelStatus(status)).toBe(true);
  });

  it("lets a status of any age count when the push time is not known", () => {
    const old = vercelStatus("success", "2020-01-01T00:00:00Z");
    expect(isVercelStatus(old, VERCEL_STATUS_CONTEXT, null)).toBe(true);
  });
});

describe("this repo's two Vercel projects", () => {
  // Each posts its own status on a push to `main`, and only yuvoy.in's counts.
  const staging = {
    ...vercelStatus("pending"),
    context: "Vercel \u2013 staging-yuvoy-web",
  };

  it("listens for yuvoy.in's project, not staging's or the bare name", () => {
    expect(VERCEL_STATUS_CONTEXT).toBe("Vercel \u2013 yuvoy-web");
    expect(isVercelStatus(vercelStatus("success"))).toBe(true);
    expect(isVercelStatus(staging)).toBe(false);
    expect(
      isVercelStatus({ ...vercelStatus("success"), context: "Vercel" }),
    ).toBe(false);
  });

  it("waits past staging's status for yuvoy.in's own", async () => {
    const c = clock();
    const watched = await watchPickup({
      readStatuses: reader([staging], [staging, vercelStatus("pending")]),
      pushedAtMs: PUSHED_AT,
      deadlineMs: 180_000,
      intervalMs: 10_000,
      now: c.now,
      sleep: c.sleep,
    });
    expect(watched.statusSeen).toBe(true);
    expect(watched.reads).toBe(2);
    expect(watched.status.context).toBe(VERCEL_STATUS_CONTEXT);
  });
});

describe("watchPickup", () => {
  it("returns on the first read when Vercel's status is already there", async () => {
    const c = clock();
    const watched = await watchPickup({
      readStatuses: reader([vercelStatus("pending")]),
      deadlineMs: 180_000,
      intervalMs: 10_000,
      now: c.now,
      sleep: c.sleep,
    });
    expect(watched.statusSeen).toBe(true);
    expect(watched.reads).toBe(1);
    expect(c.sleeps).toEqual([]);
  });

  it("keeps reading until the status appears", async () => {
    const c = clock();
    const watched = await watchPickup({
      readStatuses: reader([], [], [vercelStatus("pending")]),
      deadlineMs: 180_000,
      intervalMs: 10_000,
      now: c.now,
      sleep: c.sleep,
    });
    expect(watched.statusSeen).toBe(true);
    expect(watched.reads).toBe(3);
    expect(c.sleeps).toEqual([10_000, 10_000]);
    expect(watched.waitedMs).toBe(20_000);
  });

  it.each([
    [30_000, 4],
    [25_000, 3],
    [0, 1],
  ])(
    "with a deadline of %ims reads %i times, never sleeping past it",
    async (deadlineMs, reads) => {
      const c = clock();
      const watched = await watchPickup({
        readStatuses: reader([]),
        deadlineMs,
        intervalMs: 10_000,
        now: c.now,
        sleep: c.sleep,
      });
      expect(watched.statusSeen).toBe(false);
      expect(watched.reads).toBe(reads);
      expect(c.now()).toBeLessThanOrEqual(deadlineMs);
    },
  );

  it("remembers a failed read and carries on", async () => {
    const c = clock();
    const watched = await watchPickup({
      readStatuses: reader(new Error("api.github.com answered 502"), [
        vercelStatus("success"),
      ]),
      deadlineMs: 180_000,
      intervalMs: 10_000,
      now: c.now,
      sleep: c.sleep,
    });
    expect(watched.statusSeen).toBe(true);
    expect(watched.githubReadOk).toBe(true);
    expect(watched.lastError).toMatchObject({
      message: "api.github.com answered 502",
    });
  });

  it("knows when no read got through", async () => {
    const c = clock();
    const watched = await watchPickup({
      readStatuses: reader(new Error("api.github.com answered 502")),
      deadlineMs: 30_000,
      intervalMs: 10_000,
      now: c.now,
      sleep: c.sleep,
    });
    expect(watched.statusSeen).toBe(false);
    expect(watched.githubReadOk).toBe(false);
    expect(watched.reads).toBe(4);
  });

  it("counts an answer that is not a list as a failed read", async () => {
    const c = clock();
    const watched = await watchPickup({
      readStatuses: reader({ message: "Not Found" }),
      deadlineMs: 0,
      intervalMs: 10_000,
      now: c.now,
      sleep: c.sleep,
    });
    expect(watched.githubReadOk).toBe(false);
    expect(watched.lastError).toMatchObject({
      message: expect.stringMatching(/without a list/),
    });
  });

  it("ignores every status but Vercel's own", async () => {
    const c = clock();
    const watched = await watchPickup({
      readStatuses: reader([
        {
          ...vercelStatus("success"),
          context: "build",
          creator: { login: "github-actions[bot]" },
        },
        { ...vercelStatus("success"), context: "Vercel Preview Comments" },
      ]),
      deadlineMs: 0,
      intervalMs: 10_000,
      now: c.now,
      sleep: c.sleep,
    });
    expect(watched.statusSeen).toBe(false);
    expect(watched.githubReadOk).toBe(true);
  });

  it("waits past a preview's status left by an earlier push of the commit", async () => {
    const c = clock();
    const earlier = vercelStatus("success", "2026-10-10T09:00:00Z");
    const watched = await watchPickup({
      readStatuses: reader([earlier], [vercelStatus("pending"), earlier]),
      pushedAtMs: PUSHED_AT,
      deadlineMs: 180_000,
      intervalMs: 10_000,
      now: c.now,
      sleep: c.sleep,
    });
    expect(watched.statusSeen).toBe(true);
    expect(watched.reads).toBe(2);
    expect(watched.status.state).toBe("pending");
  });
});

describe("deploymentsOf", () => {
  it("keeps the commit's production deployments, in any state", () => {
    const list = [
      production(SHA),
      production(SHA, "ERROR"),
      production(SHA, "BUILDING"),
    ];
    expect(deploymentsOf(list, SHA)).toHaveLength(3);
  });

  it("drops previews, other commits and deployments with no commit", () => {
    const list = [
      { ...production(SHA), target: null },
      production(NEWER),
      // What a fallback deploy from Actions looks like: no .git, no commit.
      { uid: "dpl_cli", target: "production", readyState: "READY", meta: {} },
      { uid: "dpl_bare", target: "production", readyState: "READY" },
    ];
    expect(deploymentsOf(list, SHA)).toEqual([]);
  });

  it("answers an empty list when there is nothing to read", () => {
    expect(deploymentsOf(undefined, SHA)).toEqual([]);
    expect(deploymentsOf(null, SHA)).toEqual([]);
  });
});

describe("decide", () => {
  const push = { sha: SHA, branch: "main" };

  it("trusts Vercel's status over everything else", () => {
    const { verdict, why } = decide({
      ...push,
      watched: SEEN,
      vercel: NOTHING_ON_VERCEL,
      head: MOVED_ON,
    });
    expect(verdict).toBe("picked-up");
    expect(why).toBe("Vercel posted its status on d5a4571 (pending).");
  });

  it.each(["READY", "BUILDING", "ERROR", "CANCELED"])(
    "counts a %s production deployment with no status as picked up",
    (readyState) => {
      const { verdict, why } = decide({
        ...push,
        watched: UNSEEN,
        vercel: { ok: true, deployments: [production(SHA, readyState)] },
        head: STILL_MAIN,
      });
      const state = readyState.toLowerCase();
      expect(verdict).toBe("picked-up");
      expect(why).toContain(`(dpl_${state}, ${state})`);
    },
  );

  it("answers missing when Vercel has nothing and main still points at it", () => {
    const { verdict, why } = decide({
      ...push,
      watched: UNSEEN,
      vercel: NOTHING_ON_VERCEL,
      head: STILL_MAIN,
    });
    expect(verdict).toBe("missing");
    expect(why).toBe(
      "No Vercel status for this push of d5a4571 after 180s, no production deployment of it on Vercel, and main still points at it.",
    );
  });

  it("answers missing when only Vercel's deployments were unreadable", () => {
    const { verdict, why } = decide({
      ...push,
      watched: UNSEEN,
      vercel: { ok: false, error: new Error("api.vercel.com answered 403") },
      head: STILL_MAIN,
    });
    expect(verdict).toBe("missing");
    expect(why).toContain(
      "Vercel's deployments unreadable (api.vercel.com answered 403)",
    );
  });

  it("answers missing on GitHub's word alone when Vercel was not consulted", () => {
    const { verdict, why } = decide({
      ...push,
      watched: UNSEEN,
      head: STILL_MAIN,
    });
    expect(verdict).toBe("missing");
    expect(why).toContain("Vercel's deployments not consulted");
  });

  it("answers missing on Vercel's word alone when GitHub's statuses were unreadable", () => {
    const { verdict } = decide({
      ...push,
      watched: UNREAD,
      vercel: NOTHING_ON_VERCEL,
      head: STILL_MAIN,
    });
    expect(verdict).toBe("missing");
  });

  it("stands down when main has moved past the commit", () => {
    const { verdict, why } = decide({
      ...push,
      watched: UNSEEN,
      vercel: NOTHING_ON_VERCEL,
      head: MOVED_ON,
    });
    expect(verdict).toBe("superseded");
    expect(why).toBe(
      "main has moved on to 0123456, so that push decides what deploys.",
    );
  });

  it("answers unknown when the head of main could not be read", () => {
    const { verdict, why } = decide({
      ...push,
      watched: UNSEEN,
      vercel: NOTHING_ON_VERCEL,
      head: NO_HEAD,
    });
    expect(verdict).toBe("unknown");
    expect(why).toContain("(api.github.com answered 502)");
  });

  it("counts a head nobody read as unreadable", () => {
    const { verdict } = decide({
      ...push,
      watched: UNSEEN,
      vercel: NOTHING_ON_VERCEL,
    });
    expect(verdict).toBe("unknown");
  });

  it("answers unknown when neither GitHub nor Vercel could be read", () => {
    const { verdict, why } = decide({
      ...push,
      watched: UNREAD,
      vercel: { ok: false, error: new Error("api.vercel.com answered 500") },
      head: STILL_MAIN,
    });
    expect(verdict).toBe("unknown");
    expect(why).toContain("(api.github.com answered 502)");
  });

  it("never answers missing unless main is known to still point at the commit", () => {
    const watcheds = [SEEN, UNSEEN, UNREAD];
    const vercels = [
      NOTHING_ON_VERCEL,
      { ok: true, deployments: [production(SHA)] },
      { ok: false, error: new Error("api.vercel.com answered 500") },
      { ok: false },
      undefined,
    ];
    const heads = [MOVED_ON, NO_HEAD, { ok: false }, undefined];
    let checked = 0;
    for (const watched of watcheds) {
      for (const vercel of vercels) {
        for (const head of heads) {
          const { verdict } = decide({ ...push, watched, vercel, head });
          expect(verdict).not.toBe("missing");
          checked += 1;
        }
      }
    }
    expect(checked).toBe(60);
  });
});
