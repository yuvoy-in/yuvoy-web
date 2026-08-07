import { defineConfig, devices } from "@playwright/test";

/**
 * Point the suite at a deployed environment with PLAYWRIGHT_BASE_URL, e.g.
 *
 *   PLAYWRIGHT_BASE_URL=https://staging.yuvoy.in pnpm test:e2e
 *
 * When that is set we must NOT start a local dev server — the tests are meant
 * to exercise the deployment, and a local server would silently serve them
 * instead, making a red environment look green.
 */
const remoteBaseURL = process.env.PLAYWRIGHT_BASE_URL;

/**
 * A dedicated port, deliberately not 3000.
 *
 * `reuseExistingServer` attaches to whatever is already listening — it does
 * not check that the thing is *this* app. On a machine running more than one
 * project, that means the suite can silently test somebody else's site: it
 * happened, and the giveaway was an unrelated page title in a failure dump.
 * A project-specific port makes the collision impossible rather than
 * unlikely, and `pnpm dev` on 3000 stays free for actually looking at the app.
 */
const PORT = Number(process.env.PLAYWRIGHT_PORT ?? 3117);
const baseURL = remoteBaseURL || `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  /*
    Compile every route once before the workers start. See
    `e2e/support/warm-routes.ts`: without it, the first test to touch a route
    races `next dev`'s on-demand compile, and any spec that reads the DOM at a
    fixed moment can measure `loading.tsx` instead of the page. It shows up as
    unrelated failures that all pass in isolation.
  */
  globalSetup: "./e2e/support/warm-routes.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  ...(remoteBaseURL
    ? {}
    : {
        webServer: {
          command: `pnpm dev -p ${PORT}`,
          url: baseURL,
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
          env: {
            // The stubbed specs intercept "**/v1/leads". With no API base URL
            // configured, submitLead() short-circuits to "unavailable" and
            // never issues a request, so the stub never fires and the success
            // assertions fail — which is exactly what happened in CI, where no
            // NEXT_PUBLIC_* values exist. A placeholder origin keeps the suite
            // self-contained and independent of any deployed environment.
            NEXT_PUBLIC_API_BASE_URL:
              process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://api.test",
          },
        },
      }),
});
