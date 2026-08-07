import { request, type FullConfig } from "@playwright/test";

/**
 * Compile every route once, before any test runs.
 *
 * ## The problem this removes
 *
 * The suite runs against `next dev`, which compiles a route the first time it
 * is requested. With seven workers starting at once, the first test to touch a
 * route pays that cost while six others queue behind it — and a test that
 * reads the DOM at a fixed moment (counting headings, measuring overflow,
 * matching text) can capture `loading.tsx` instead of the page.
 *
 * It surfaces as a scatter of unrelated failures that all pass in isolation,
 * which is the most expensive kind of red build: it looks like a real defect
 * every time, and it moves. It has cost this project several rounds already,
 * and each round was fixed by hardening one more test — which does not scale,
 * because the next route added puts the next marginal test over the edge.
 *
 * Warming is the actual fix. One sequential pass over every route costs a few
 * seconds once, and after it there is no cold compile left for any test to
 * race against.
 *
 * ## Why it is deliberately forgiving
 *
 * A warm-up that fails must never fail the run. It is an optimisation, not an
 * assertion — the specs are what assert. A route that 404s or 410s here is
 * fine and expected (`/philosophy` is intentionally gone), and a request that
 * throws just means that route stays cold, which is exactly where the suite
 * was before this existed.
 */

/**
 * Every route a spec navigates to. Kept explicit rather than derived from the
 * sitemap: the sitemap lists what should be *indexed*, which is not the same
 * set — it excludes the campaign routes and the legal pages that specs do
 * visit.
 */
const ROUTES = [
  "/",
  "/explore",
  "/operators",
  "/about",
  "/contact",
  "/waitlist",
  "/safety",
  "/journal",
  "/journal/why-the-andamans",
  "/destinations/havelock",
  "/destinations/neil-island",
  "/destinations/port-blair",
  "/privacy",
  "/terms",
  "/go/ferry",
  "/go/kiosk",
  "/go/hotel",
  "/go/instagram",
  "/go/direct",
  "/sitemap.xml",
  "/robots.txt",
];

export default async function warmRoutes(config: FullConfig) {
  const baseURL = config.projects[0]?.use?.baseURL;
  if (!baseURL) return;

  const context = await request.newContext({ baseURL });

  /*
    The dev server may still be binding when this runs, so the first request
    gets a short retry. Everything after it is sequential on purpose: firing
    twenty parallel requests at a compiler is the very contention being
    removed.
  */
  for (let attempt = 0; attempt < 10; attempt++) {
    try {
      await context.get("/", { timeout: 30_000 });
      break;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 1_000));
    }
  }

  for (const route of ROUTES) {
    try {
      await context.get(route, { timeout: 60_000 });
    } catch {
      // Cold is the status quo ante. Never fail the run for a warm-up.
    }
  }

  await context.dispose();
}
