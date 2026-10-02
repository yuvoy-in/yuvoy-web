import { describe, it, expect, vi, afterEach } from "vitest";
import {
  SECRET_PLACEHOLDER,
  assertNoSecretPublicVars,
  secretPublicVars,
} from "./public-env";

/**
 * A public variable stored as a Secret in Vercel reaches the build as
 * "[SENSITIVE]" and ships (see public-env.ts). These pin the check, and the
 * last block pins that `next.config.ts` actually runs it: a helper nobody
 * calls would pass every other test here while guarding nothing.
 */

describe("secretPublicVars", () => {
  it("finds nothing in an ordinary environment", () => {
    expect(
      secretPublicVars({
        NEXT_PUBLIC_SITE_ENV: "production",
        NEXT_PUBLIC_POSTHOG_KEY: "",
        NODE_ENV: "production",
      }),
    ).toEqual([]);
  });

  it("names every public variable that arrived as the placeholder, sorted", () => {
    expect(
      secretPublicVars({
        NEXT_PUBLIC_SITE_ENV: SECRET_PLACEHOLDER,
        NEXT_PUBLIC_POSTHOG_KEY: ` ${SECRET_PLACEHOLDER}\n`,
        NEXT_PUBLIC_SITE_URL: "https://yuvoy.in",
      }),
    ).toEqual(["NEXT_PUBLIC_POSTHOG_KEY", "NEXT_PUBLIC_SITE_ENV"]);
  });

  it("leaves a server-only Secret alone", () => {
    // Read when a request arrives, and by then Vercel supplies the value.
    expect(secretPublicVars({ API_SECRET: SECRET_PLACEHOLDER })).toEqual([]);
  });

  it("matches the placeholder exactly, not a value that contains it", () => {
    expect(
      secretPublicVars({ NEXT_PUBLIC_NOTE: `not ${SECRET_PLACEHOLDER} here` }),
    ).toEqual([]);
  });
});

describe("assertNoSecretPublicVars", () => {
  it("lets an ordinary environment through", () => {
    expect(() =>
      assertNoSecretPublicVars({ NEXT_PUBLIC_SITE_ENV: "production" }),
    ).not.toThrow();
  });

  it("stops the build, naming each variable and the fix", () => {
    const run = () =>
      assertNoSecretPublicVars({
        NEXT_PUBLIC_SITE_ENV: SECRET_PLACEHOLDER,
        NEXT_PUBLIC_POSTHOG_KEY: SECRET_PLACEHOLDER,
      });
    expect(run).toThrow(/NEXT_PUBLIC_POSTHOG_KEY, NEXT_PUBLIC_SITE_ENV:/);
    expect(run).toThrow(/add it again as type Config/);
  });
});

describe("next.config.ts", () => {
  async function loadConfig() {
    vi.resetModules();
    return import("../../../next.config");
  }

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("loads in an ordinary environment", async () => {
    await expect(loadConfig()).resolves.toHaveProperty("default");
  });

  it("refuses to load when a public variable arrived as a Secret", async () => {
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", SECRET_PLACEHOLDER);
    await expect(loadConfig()).rejects.toThrow(/^NEXT_PUBLIC_POSTHOG_KEY:/);
  });
});
