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
 * True only on the production Vercel project (set `NEXT_PUBLIC_SITE_ENV=production`
 * there). Everything else — staging, previews, local — is non-prod → noindexed
 * + shows a STAGING badge. Uses an explicit env var because CLI/Actions deploys
 * don't carry Vercel's Git env vars.
 */
export const IS_PRODUCTION = process.env.NEXT_PUBLIC_SITE_ENV === "production";
