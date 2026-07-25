/** The real production domain. */
const PRODUCTION_URL = "https://yuvoy.in";

/**
 * True only on the production Vercel project (set `NEXT_PUBLIC_SITE_ENV=production`
 * there). Everything else — staging, previews, local — is non-prod → noindexed
 * + shows a STAGING badge + skips Speed Insights. Uses an explicit env var
 * because CLI/Actions deploys don't carry Vercel's Git env vars.
 */
export const IS_PRODUCTION = process.env.NEXT_PUBLIC_SITE_ENV === "production";

/**
 * Absolute site origin (no trailing slash).
 * - Production → https://yuvoy.in
 * - Staging / preview → the Vercel deployment URL
 * - Local → http://localhost:3000
 * Override anywhere with NEXT_PUBLIC_SITE_URL.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (IS_PRODUCTION
    ? PRODUCTION_URL
    : process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000")
).replace(/\/$/, "");
