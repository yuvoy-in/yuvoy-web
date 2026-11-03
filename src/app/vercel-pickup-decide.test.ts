import { describe, it, expect } from "vitest";
import { decide, deploymentsOf } from "../../scripts/vercel-pickup.mjs";
import { vercelStatus } from "./vercel-pickup-kit";

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
