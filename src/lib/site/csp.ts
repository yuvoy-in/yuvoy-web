/**
 * Content-Security-Policy for the marketing site — yuvoy-web#153.
 *
 * ## What is actually at risk here
 *
 * This site holds no session, no token and no money. Nobody signs in. The
 * realistic worst case is form-jacking: an injected script rewriting where
 * the waitlist and operator-application forms post, and harvesting names,
 * phone numbers and email addresses as people type them.
 *
 * That is personal data, collected under a privacy policy that promises
 * specific handling, from people who trusted a brand-new company enough to
 * hand over a phone number. It is a smaller problem than the traveller app's,
 * where the equivalent script walks away with booking credentials — and this
 * is the domain that carries the brand, the one that goes on a printed card
 * and in a WhatsApp message to an operator.
 *
 * `connect-src` is the directive that matters: it is what leaves a
 * form-jacker nowhere to send what it scrapes. `form-action` matters for the
 * same reason from the other direction — a rewritten `action` is the simplest
 * version of the same attack, and it does not go through `fetch` at all.
 *
 * ## Why there is no nonce
 *
 * The documented Next shape is a per-request nonce from `middleware.ts`.
 * There is no `middleware.ts` here and there should not be: a page only
 * learns its nonce by reading `headers()`, which opts the route out of static
 * rendering, and this site is static almost end to end — no route sets
 * `force-dynamic` or `revalidate`.
 *
 * Hashing is not the way out either. `BrandIntro` renders one inline script
 * whose contents ARE fixed (`INTRO_DECIDE`), so it could be hashed — but Next
 * also emits its own inline bootstrap, and adding any hash or nonce to
 * `script-src` makes the browser IGNORE `'unsafe-inline'`. One hash would
 * therefore block the framework's own scripts and white-screen the site.
 *
 * So `script-src` keeps `'unsafe-inline'`, and the honest statement of what
 * this policy buys is: it does not stop a script running, it stops one
 * sending anything anywhere. That is the whole of what the issue asked for,
 * and `'unsafe-inline'` in `script-src` weakens nothing else here.
 *
 * ## Rollout
 *
 * Report-only first, then enforce. A policy written from reading the code is
 * a guess; a policy written from a report is a fact. `ENFORCED` is the subset
 * that cannot break a page that works today.
 */

/** An origin, or nothing when the URL is unusable. Never a path. */
function originOf(url: string | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

export interface CspEnv {
  /** PostHog's ingestion host. `analyticsHostedInEu` guards where it points. */
  posthogHost?: string;
  /** Development needs HMR's websocket and eval; production must not have them. */
  dev?: boolean;
}

export function cspDirectives(env: CspEnv): string[] {
  const posthog = originOf(env.posthogHost);

  const connect = [
    "'self'",
    ...(posthog ? [posthog] : []),
    ...(env.dev ? ["ws:", "wss:"] : []),
  ];

  return [
    // Fails closed: a directive nobody thought of inherits 'none'.
    `default-src 'none'`,
    `script-src 'self' 'unsafe-inline'${env.dev ? " 'unsafe-eval'" : ""}`,
    /*
      The product demo drives its own animation — duration, play state and the
      detail scroller's offset — through inline styles from React, which
      `globals.css` documents twice. Those are `style-src`, not `script-src`,
      and `'unsafe-inline'` for styles is a much smaller concession. It is
      also the thing most likely to break silently and be blamed on something
      else, which is the reason for a report-only run rather than a guess.
    */
    `style-src 'self' 'unsafe-inline'`,
    // Every image is in `public/` and served same-origin through the
    // optimiser. `data:` is what `next/image` inlines blur placeholders as.
    `img-src 'self' data:`,
    /*
      `next/font` — both `local` and `google` — downloads and SELF-HOSTS at
      build time, so there is no `fonts.googleapis.com` stylesheet and no
      `fonts.gstatic.com` font file at runtime. `'self'` is not an oversight
      here; if a font host ever appears in a report, something has changed
      about how fonts are loaded and that is the thing to look at.
    */
    `font-src 'self'`,
    `connect-src ${connect.join(" ")}`,
    `media-src 'self'`,
    `worker-src 'self'`,
    `manifest-src 'self'`,
    `frame-src 'none'`,
    // Costless, and each closes a route out for a script that has scraped a
    // form: `form-action` is the form-jacker's own exit.
    `object-src 'none'`,
    `base-uri 'none'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
  ];
}

/**
 * The subset enforced today.
 *
 * Nothing on this site uses any of these capabilities — there is no
 * `<object>`, no `<base>`, and nothing frames the site — so each can be
 * turned on without a report. The rest waits for a real report-only run
 * against production, because a policy that breaks the site is worse than no
 * policy: it gets reverted and nobody tries again for six months.
 */
const ENFORCED = new Set(["object-src", "base-uri", "frame-ancestors"]);

export function enforcedCsp(env: CspEnv): string {
  return cspDirectives(env)
    .filter((d) => ENFORCED.has(d.split(" ")[0]))
    .join("; ");
}

export function reportOnlyCsp(env: CspEnv): string {
  return cspDirectives(env).join("; ");
}

export function cspHeaders(env: CspEnv): { key: string; value: string }[] {
  return [
    { key: "Content-Security-Policy", value: enforcedCsp(env) },
    { key: "Content-Security-Policy-Report-Only", value: reportOnlyCsp(env) },
  ];
}
