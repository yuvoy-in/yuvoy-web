/**
 * Which listing posters this site will put through its image optimiser
 * (yuvoy-web#171).
 *
 * Every poster the API serves is a Cloudflare Stream thumbnail on the
 * account's own customer host. `next.config.ts` allows exactly
 * `POSTER_REMOTE_PATTERN`, and the homepage's listing reader skips any poster
 * that fails `isAllowedPoster`, so a poster on another host never reaches
 * `next/image`, where the optimiser would refuse it and the visitor would get
 * a broken picture. `listing-poster.test.ts` holds the two to the same answer
 * using Next's own matcher.
 *
 * **The exact host, not `*.cloudflarestream.com`.** The optimiser fetches
 * whatever it is allowed to, so a wildcard would let anyone resize any Stream
 * customer's thumbnails on this site's image quota. If the API ever moves to
 * another Stream account, its posters stop matching, the homepage shows its
 * no-listing state rather than a broken one, and this host is the one line to
 * change.
 *
 * Kept free of imports because `next.config.ts` loads it.
 */
export const POSTER_HOST = "customer-4z59qj89vkgk3xbs.cloudflarestream.com";

/**
 * The entry `next.config.ts` puts in `images.remotePatterns`: HTTPS on the
 * default port, `/<video id>/thumbnails/<file>`, any query (Stream takes
 * `time` and `height` there).
 */
export const POSTER_REMOTE_PATTERN = {
  protocol: "https",
  hostname: POSTER_HOST,
  port: "",
  pathname: "/*/thumbnails/**",
} as const;

/** The same path as the pattern's glob, as a test this file can run. */
const POSTER_PATH = /^\/[^/]+\/thumbnails\/[^/].*$/;

export function isAllowedPoster(url: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  return (
    parsed.protocol === "https:" &&
    parsed.hostname === POSTER_HOST &&
    parsed.port === "" &&
    parsed.username === "" &&
    parsed.password === "" &&
    POSTER_PATH.test(parsed.pathname)
  );
}
