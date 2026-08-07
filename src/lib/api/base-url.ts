/**
 * Where the Go API lives. Empty in environments where the backend is not yet
 * deployed — a submission then reports `unavailable` truthfully instead of
 * pretending to succeed. Read at call time: Next inlines NEXT_PUBLIC_* values
 * either way, and tests can stub the env per case.
 *
 * **The scheme is added if it is missing, and that is not cosmetic.** A value
 * of `api.yuvoy.in` (no scheme) makes `fetch()` treat the URL as a *relative
 * path*, so every submission silently posts to
 * `https://<this-site>/api.yuvoy.in/v1/leads` and 404s. It looks exactly like
 * an API outage, and it reached production once. A misconfigured env var must
 * not be able to quietly convert a working form into a dead one.
 *
 * Shared rather than copied: it moved here from `@/lib/leads/api` when
 * `/v1/messages` landed (2026-08-07). Two endpoints resolving their host by
 * two implementations is how one of them ends up with the trailing-slash bug
 * the other already fixed.
 */
export function apiBaseUrl(): string {
  const configured = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").trim();
  if (!configured) return "";

  const withScheme = /^https?:\/\//i.test(configured)
    ? configured
    : `https://${configured}`;

  return withScheme.replace(/\/+$/, "");
}
