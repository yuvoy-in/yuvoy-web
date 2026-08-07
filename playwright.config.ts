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
          /*
            CI tests a production build; local runs use the dev server.

            This is not a performance tweak, though it is also that (the suite
            drops from ~1m36s to ~51s locally). `next dev` compiles routes on
            demand and leaves React's streaming staging container in the DOM
            with a **full second copy of the route inside it** — measured, on
            `/operators` and `/journal`:

                dev    stagingBlocks 1   h1 2   main 2
                build  stagingBlocks 0   h1 1   main 1

            Every consequence of that is a test failure with no defect behind
            it: two `<h1>` where the page has one, `#panel-provider` resolving
            to two elements and tripping strict mode, and `pageText` reading
            every string twice. The suite had grown waits and filters to work
            around it. Testing the artefact that actually ships removes the
            cause instead, and means a green run says something about the
            deployed site rather than about a dev server.

            `reuseExistingServer` stays off in CI, so this always builds fresh.

            The helpers those workarounds live in are kept, because a local
            `pnpm test:e2e` still runs against `next dev` and still needs them.
            Set `E2E_PROD=1` to reproduce a CI run locally.
          */
          command:
            process.env.CI || process.env.E2E_PROD
              ? `pnpm build && pnpm start -p ${PORT}`
              : `pnpm dev -p ${PORT}`,
          url: baseURL,
          reuseExistingServer: !process.env.CI,
          // A production build has to finish inside this budget, not just a
          // dev server's first response.
          timeout: process.env.CI || process.env.E2E_PROD ? 420_000 : 120_000,
          env: {
            // The stubbed specs intercept "**/v1/leads". With no API base URL
            // configured, submitLead() short-circuits to "unavailable" and
            // never issues a request, so the stub never fires and the success
            // assertions fail — which is exactly what happened in CI, where no
            // NEXT_PUBLIC_* values exist. A placeholder origin keeps the suite
            // self-contained and independent of any deployed environment.
            //
            // It has to be set for the *build*, not just the server, because
            // `NEXT_PUBLIC_*` is inlined at build time — which is why the
            // build runs inside `command` above rather than as its own step.
            NEXT_PUBLIC_API_BASE_URL:
              process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://api.test",
          },
        },
      }),
});
