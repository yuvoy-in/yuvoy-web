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
const baseURL = remoteBaseURL || "http://localhost:3000";

export default defineConfig({
  testDir: "./e2e",
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
          command: "pnpm dev",
          url: "http://localhost:3000",
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
        },
      }),
});
