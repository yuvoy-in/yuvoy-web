import { describe, it, expect, vi, afterEach } from "vitest";

/**
 * The two questions /privacy asks the code before describing itself.
 *
 * The privacy page used to state, in prose, that no analytics were running. It
 * also promised the page would be updated *before* they went live — which made
 * the correct order "edit the page, then set the key", and left the page
 * claiming analytics ran during the gap. Either ordering produced a window in
 * which a legal page was untrue (yuvoy-web#84).
 *
 * These predicates are what removed the window, so they are worth pinning.
 */

async function load(env: { key?: string; host?: string }) {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", env.key ?? "");
  vi.stubEnv("NEXT_PUBLIC_POSTHOG_HOST", env.host ?? "");
  return import("./config");
}

afterEach(() => vi.unstubAllEnvs());

describe("analyticsConfigured", () => {
  it("is false with no key, so there is nothing to consent to", async () => {
    const { analyticsConfigured } = await load({});
    expect(analyticsConfigured()).toBe(false);
  });

  it("is false for an empty key, not just a missing one", async () => {
    // An env var created in a dashboard with no value is the easiest mistake
    // there is, and `?? ""` does not catch it — the length check does.
    const { analyticsConfigured } = await load({ key: "" });
    expect(analyticsConfigured()).toBe(false);
  });

  it("is true once a key is set", async () => {
    const { analyticsConfigured } = await load({ key: "phc_abc123" });
    expect(analyticsConfigured()).toBe(true);
  });
});

describe("analyticsHostedInEu", () => {
  it("defaults to the EU, which is what the page promises", async () => {
    const { analyticsHostedInEu, apiHost } = await load({ key: "phc_x" });
    expect(apiHost()).toBe("https://eu.i.posthog.com");
    expect(analyticsHostedInEu()).toBe(true);
  });

  it("stops promising the EU when the host is pointed elsewhere", async () => {
    // The whole reason this is derived. A US project with the host overridden
    // to match would otherwise leave /privacy stating something false, with
    // nothing in the codebase disagreeing.
    const { analyticsHostedInEu } = await load({
      key: "phc_x",
      host: "https://us.i.posthog.com",
    });
    expect(analyticsHostedInEu()).toBe(false);
  });

  it("accepts PostHog's other EU hostname", async () => {
    const { analyticsHostedInEu } = await load({
      key: "phc_x",
      host: "https://eu.posthog.com",
    });
    expect(analyticsHostedInEu()).toBe(true);
  });

  it("refuses to promise anything about a host it cannot parse", async () => {
    const { analyticsHostedInEu } = await load({
      key: "phc_x",
      host: "not a url",
    });
    expect(analyticsHostedInEu()).toBe(false);
  });
});
