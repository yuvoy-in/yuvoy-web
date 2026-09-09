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
 * ## Rollout — now enforced
 *
 * Shipped report-only on 9 Sep 2026 and enforced the same day, on the owner's
 * call, against evidence rather than a waiting period.
 *
 * The evidence is `pnpm verify` run with this policy ENFORCED: the end-to-end
 * suite drives the real production build in a real browser across every
 * indexable route, both lead forms, the product demo's animation and the
 * consent flow. A directive that blocks anything they touch fails the suite
 * rather than a visitor.
 *
 * **What it does not cover.** The suite never grants analytics consent against
 * a real key, so no request leaves for `eu.i.posthog.com`; that host is in
 * `connect-src` from reading the call site rather than from watching one
 * succeed. The report-only header therefore stays alongside the enforced one
 * carrying the SAME policy — an enforced-only header blocks silently, while
 * report-only is what names the directive in the console.
 */

/**
 * An origin, or nothing when the URL is unusable. Never a path.
 *
 * The missing scheme is repaired here as well as in `apiBaseUrl`, and that is
 * deliberate duplication rather than an oversight. `new URL("api.yuvoy.in")`
 * throws, so a caller passing the raw environment variable instead of the
 * repaired one would drop the API from `connect-src` — and the symptom of
 * that is every form on the site failing silently, with no error the browser
 * reports and nothing in this file to suggest why.
 *
 * A directive whose failure is invisible is worth being defensive about twice.
 */
function originOf(url: string | undefined): string | null {
  const raw = url?.trim();
  if (!raw) return null;
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    return new URL(withScheme).origin;
  } catch {
    return null;
  }
}

export interface CspEnv {
  /**
   * The Go API, which **both lead forms and the contact form post to**.
   *
   * This was missing from the first draft of the policy, and enforcing it
   * without this would have killed every form on the site — the waitlist, the
   * operator application and `/contact` — which is the entire reason this site
   * exists. The e2e suite caught it the moment the policy went from
   * report-only to enforced, and that is exactly the failure report-only mode
   * cannot show you: a report-only header records a violation and lets the
   * request through, so the forms would have kept working right up until the
   * day somebody enforced it.
   *
   * Empty in environments where the backend is not deployed, in which case
   * `submitLead` short-circuits and never issues a request — so an absent
   * value is correct rather than a hole.
   */
  apiBaseUrl?: string;
  /** PostHog's ingestion host. `analyticsHostedInEu` guards where it points. */
  posthogHost?: string;
  /** Development needs HMR's websocket and eval; production must not have them. */
  dev?: boolean;
}

export function cspDirectives(env: CspEnv): string[] {
  const api = originOf(env.apiBaseUrl);
  const posthog = originOf(env.posthogHost);

  const connect = [
    "'self'",
    // The origin, never the path. A path in a source expression does not match
    // and is not an error the browser reports — every form would simply fail.
    ...(api ? [api] : []),
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
 * The whole policy is enforced.
 *
 * It was a three-directive subset for one day. Kept as its own function rather
 * than collapsed into `reportOnlyCsp` so that narrowing it again is a one-line
 * change with somewhere to put the reason.
 */
export function enforcedCsp(env: CspEnv): string {
  return cspDirectives(env).join("; ");
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
