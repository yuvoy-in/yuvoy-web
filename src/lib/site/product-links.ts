import type { LeadSource } from "@/lib/leads/registry";

/**
 * Links from the marketing site into the product — yuvoy-web#154.
 *
 * Both hosts are live and both are being shared, so this site links to them.
 * `yuvoy.in` had **no link to either** — `git grep "app.yuvoy.in"` returned
 * nothing across the whole repository — which was correct while there was
 * nothing to send anybody to, and stopped being correct on launch.
 *
 * This is NOT the D-102 cutover. The app stays on `app.yuvoy.in` and the
 * portal on `operators.yuvoy.in`; the root domain keeps this site. That move
 * is yuvoy-app#12 and is separately deferred.
 *
 * ## The four parameters, and the one that was wrong
 *
 * The traveller app reads exactly four: `src`, `code`, `placement`,
 * `campaign`. It ignores `utm_*` and `ref` entirely, so a link carrying those
 * records nothing.
 *
 * `src` must be a value on the API's `Attribution.source` enum, and the
 * obvious one — `web` — **was not on it**. yuvoy-web#154 asked yuvoy-app to
 * add it; that was the wrong repository, because the app derives its validator
 * from the contract with a `satisfies` clause precisely so a client cannot
 * drift from the server's list. Raised as yuvoy-api#134 and shipped in #135,
 * and this file is the only place the value is written down.
 *
 * `web` and not `referral`: the column defines `referral` as somebody else's
 * site, and filing our own traffic under it makes the one channel we control
 * indistinguishable from the ones we do not. Not `direct` either — that means
 * the address was typed.
 *
 * ## Why the two campaign schemes stay separate
 *
 * This site has `/go/<source>` with `ferry | kiosk | hotel | instagram |
 * direct`, feeding lead rows. The app has a different `/go/<code>` feeding the
 * scans table. They answer different questions and must not be unified — the
 * only bridge is the parameters below, where the site's campaign source
 * travels as `campaign`, which is free text on the contract, rather than being
 * forced into an `src` enum that has no room for it.
 */

export const APP_URL = "https://app.yuvoy.in";
export const OPERATOR_PORTAL_URL = "https://operators.yuvoy.in";

/**
 * Where on this site the tap happened. "Which card, which boat, which door."
 *
 * A closed set rather than free text, so the funnel groups: two spellings of
 * "header" are two rows in a report nobody can read.
 */
export type Placement =
  "header" | "hero" | "explore" | "destination" | "footer" | "menu";

/**
 * A link into the traveller app, carrying attribution it will actually read.
 *
 * `campaign` is only added for a real campaign arrival. `web` is the default
 * source for organic traffic on this site, so a `?campaign=web` would be a
 * parameter that says nothing and can be shared, indexed and cached.
 */
export function appHref(placement: Placement, source?: LeadSource): string {
  const params = new URLSearchParams({ src: "web", placement });
  if (source && source !== "web") params.set("campaign", source);
  return `${APP_URL}/?${params.toString()}`;
}

/**
 * A link into the operator portal.
 *
 * `/signup` rather than the portal root: an operator arriving from "Apply as a
 * founding operator" is asking to create an account, and the root redirects
 * through `/today` to `/sign-in`, which is the wrong door for somebody who has
 * no account yet.
 *
 * **No attribution parameters.** The portal reads none — it has no
 * `AttributionCapture` and no scans table — and adding them would be decoration
 * that survives into somebody's address bar. The on-site application form
 * still records `source` for operators who take that route.
 */
export function operatorPortalHref(): string {
  return `${OPERATOR_PORTAL_URL}/signup`;
}
