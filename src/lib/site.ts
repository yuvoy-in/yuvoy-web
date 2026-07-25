/**
 * Absolute site origin (no trailing slash).
 * - Local: http://localhost:3000
 * - Vercel: the project's production URL, injected automatically
 * - Custom domain later: set NEXT_PUBLIC_SITE_URL (e.g. https://yuvoy.in)
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")
).replace(/\/$/, "");

/**
 * True only for the canonical production deploy (`main` on the prod Vercel
 * project). Staging (`dev`) and preview deploys are false → they get noindexed
 * and show a STAGING badge.
 */
export const IS_PRODUCTION = process.env.VERCEL_GIT_COMMIT_REF === "main";
