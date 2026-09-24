/**
 * A public variable that Vercel keeps secret, caught before it ships.
 *
 * A `NEXT_PUBLIC_*` value is written into the JavaScript every visitor
 * downloads, so it cannot be a secret. Vercel does not refuse one that is
 * stored as a Secret (the old "Sensitive" switch): the build receives the
 * literal `[SENSITIVE]` in its place, inlines that, and nothing errors.
 *
 * This site shipped it. On 24 Sep 2026 yuvoy.in was found starting PostHog
 * with "[SENSITIVE]" as its key, because `analyticsConfigured()` only asks
 * whether a key is present: a consent banner, a privacy page saying analytics
 * run, and not one event recorded. (yuvoy-app had already lost three
 * production deploys to the same placeholder on 1 Sep.) The worst quiet case
 * here is `NEXT_PUBLIC_SITE_ENV`: the placeholder is not "production", so the
 * live site would ask search engines not to index it and wear a STAGING badge.
 *
 * So `next.config.ts` calls this before the config is built, and the build
 * stops with the variables to fix instead of shipping a site that half works.
 * Only public variables are checked: a server-only Secret is read when a
 * request arrives, and by then Vercel supplies the real value.
 */

/** What Vercel hands a build in place of a Secret's value. */
export const SECRET_PLACEHOLDER = "[SENSITIVE]";

/** Names and values only; `process.env` is one of these. */
type Env = Readonly<Record<string, string | undefined>>;

/** The public variables in `env` that arrived as the placeholder, sorted. */
export function secretPublicVars(env: Env): string[] {
  return Object.keys(env)
    .filter(
      (name) =>
        name.startsWith("NEXT_PUBLIC_") &&
        env[name]?.trim() === SECRET_PLACEHOLDER,
    )
    .sort();
}

/** Throws, naming each variable and the fix, if any public one is a Secret. */
export function assertNoSecretPublicVars(env: Env = process.env): void {
  const names = secretPublicVars(env);
  if (names.length === 0) return;
  throw new Error(
    `${names.join(", ")}: stored in Vercel as a Secret, so this build ` +
      `received ${SECRET_PLACEHOLDER} instead of the value and would ship ` +
      `that to every browser. A public variable cannot be secret. In the ` +
      `Vercel project, open Settings, then Environment Variables, delete ` +
      `each one and add it again as type Config, then redeploy.`,
  );
}
