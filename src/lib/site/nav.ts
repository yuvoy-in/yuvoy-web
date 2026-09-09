import { OPERATOR_PORTAL_URL } from "@/lib/site/product-links";
/**
 * The site's route registry — the single source of truth for navigation.
 *
 * **A route appears here only once its page exists and renders.** The header,
 * the site menu and the footer are all derived from this list, so a link can
 * never point at a route that was planned but never shipped.
 *
 * ## The header names three routes and the call to action
 *
 * Explore, For Operators, About, then Join Waitlist (owner direction,
 * 2026-08-06). That is the whole of the primary navigation, on every
 * breakpoint. It replaced a five-item bar — Experiences, Destinations, How it
 * works, For travellers, For operators — whose first four all answered the
 * same question in four places; they are now one page, `/explore`, and the old
 * URLs redirect onto its sections.
 *
 * Journal stays out of the desktop bar until there is enough of it to justify
 * a slot, and lives in the menu and the footer meanwhile. **Adding a fifth
 * header item is a design change, not a routing one** — it goes through review
 * rather than through this file.
 */

import { CONTACT_CHANNEL_LIST } from "@/lib/site/contact";

/** Which footer column a route belongs to, if any. */
export type FooterColumn = "explore" | "yuvoy" | "trust";

export interface SiteRoute {
  href: string;
  /** Label used in the header nav, the site menu and the footer column. */
  label: string;
  /** Show inline in the desktop (`lg`+) header nav. */
  inHeader?: boolean;
  /**
   * Show in the shutter menu, which is the whole of navigation below `lg`.
   * Set explicitly rather than derived: the menu carries Safety, which sits in
   * the footer's Trust column, and omits the legal pages, which are pinned
   * along the bottom of the panel instead. A derived rule got both wrong.
   */
  inMenu?: boolean;
  /** Footer column placement; omit to keep the route out of the footer. */
  footer?: FooterColumn;
}

/**
 * Every navigable route on the site. Order is meaningful — it is the order
 * shown in the header, in the menu and within each footer column.
 */
export const SITE_ROUTES: SiteRoute[] = [
  {
    href: "/explore",
    label: "Explore",
    inHeader: true,
    inMenu: true,
    footer: "explore",
  },
  {
    href: "/operators",
    label: "For Operators",
    inHeader: true,
    inMenu: true,
    footer: "yuvoy",
  },
  {
    href: "/about",
    label: "About",
    inHeader: true,
    inMenu: true,
    footer: "yuvoy",
  },
  { href: "/journal", label: "Journal", inMenu: true, footer: "explore" },
  { href: "/contact", label: "Contact", inMenu: true, footer: "yuvoy" },
  { href: "/safety", label: "Safety", inMenu: true, footer: "trust" },
  { href: "/waitlist", label: "Join Waitlist", footer: "yuvoy" },
  { href: "/privacy", label: "Privacy", footer: "trust" },
  { href: "/terms", label: "Terms", footer: "trust" },
];

/**
 * The desktop header nav, in registry order. From `lg` up these sit inline in
 * the bar. Below `lg` the shutter menu carries navigation instead, and the bar
 * holds only the mark and the menu trigger.
 */
export const NAV_ITEMS: { href: string; label: string }[] = SITE_ROUTES.filter(
  (r) => r.inHeader,
).map(({ href, label }) => ({ href, label }));

/**
 * What the site menu lists. The waitlist is excluded because it is the
 * panel's call to action, and the legal routes because they are pinned along
 * its foot.
 */
export const MENU_ITEMS: { href: string; label: string }[] = SITE_ROUTES.filter(
  (r) => r.inMenu,
).map(({ href, label }) => ({ href, label }));

/** The legal routes, pinned to the bottom of the menu panel. */
export const LEGAL_ITEMS: { href: string; label: string }[] =
  SITE_ROUTES.filter((r) => r.footer === "trust" && !r.inMenu).map(
    ({ href, label }) => ({ href, label }),
  );

export const FOOTER_COLUMN_TITLES: Record<FooterColumn, string> = {
  explore: "Explore",
  yuvoy: "Yuvoy",
  trust: "Trust",
};

const FOOTER_ORDER: FooterColumn[] = ["explore", "yuvoy", "trust"];

/**
 * One extra footer entry that is a section rather than a route.
 *
 * The launch market deserves a named way in from the footer, and it has no
 * page of its own — the homepage's first-launch section is where it lives.
 * Kept out of `SITE_ROUTES` because that list's contract is "routes that
 * exist", and a fragment is not a route.
 */
const FOOTER_EXTRAS: Partial<
  Record<FooterColumn, { href: string; label: string }[]>
> = {
  explore: [{ href: "/#destinations", label: "Andaman Islands" }],
  /*
    The two product hosts — yuvoy-web#154. Both are live and being shared, and
    until now `git grep "app.yuvoy.in"` returned nothing across this entire
    repository: the marketing site linked to neither.

    The footer is the right home for the OPERATOR one specifically. The
    "Apply as a founding operator" call to action deliberately still points at
    the on-site form, because that form carries the campaign `source` through
    to a lead row and the portal reads no attribution at all — sending a
    `/go/hotel` arrival straight to `operators.yuvoy.in` would lose the
    attribution silently and permanently, which is the exact failure
    yuvoy-web#70 was raised for. The applicant is told about the portal by the
    API's own `next` sentence on the success screen (yuvoy-web#150).

    So this is the door for an operator who already has an account, which the
    form is not.
  */
  yuvoy: [{ href: OPERATOR_PORTAL_URL, label: "Operator sign-in" }],
};

/**
 * Footer columns, empty ones dropped — an empty column heading reads as a
 * broken page.
 */
export const FOOTER_COLUMNS: {
  key: FooterColumn;
  title: string;
  items: { href: string; label: string }[];
}[] = FOOTER_ORDER.map((key) => {
  const routes = SITE_ROUTES.filter((r) => r.footer === key).map(
    ({ href, label }) => ({ href, label }),
  );
  const extras = FOOTER_EXTRAS[key] ?? [];
  // Extras sit after the first route so "Explore" leads its own column and
  // the market reads as something within it.
  const items =
    key === "explore" ? [routes[0], ...extras, ...routes.slice(1)] : routes;
  return {
    key,
    title: FOOTER_COLUMN_TITLES[key],
    items: items.filter(Boolean),
  };
}).filter((column) => column.items.length > 0);

/**
 * The canonical short-form call to action, repeated in the header, the mobile
 * menu and the footer.
 *
 * **It points at the app now** — yuvoy-web#154. Both product hosts are live
 * and being shared, so the marketing site sends travellers to the thing rather
 * than to a form about the thing. It used to be "Join Waitlist" → `/waitlist`,
 * which was right for exactly as long as there was nothing to browse.
 *
 * The `href` is not here because it carries attribution that depends on where
 * the tap happened — see `appHref` in `lib/site/product-links.ts`. Only the
 * label is canonical; the destination is built per placement.
 *
 * The waitlist is NOT retired (owner's call, 9 Sep 2026). It is still the only
 * way to hear about a destination the first season does not cover, so it keeps
 * its page and its links from the footer and from `/explore` — it simply
 * stops being the thing every button on the site does.
 */
export const PRIMARY_CTA = {
  label: "Browse experiences",
} as const;

/** The waitlist, now a secondary path rather than the destination. */
export const WAITLIST_CTA = {
  href: "/waitlist",
  label: "Join the waitlist",
} as const;

/**
 * Routes that render their own masthead instead of the site header.
 *
 * **One route, for one reason.** `/waitlist` exists to have a form filled in,
 * and the standing header offers three ways off it plus a call to action
 * pointing at the page the visitor is already on. It carries `WaitlistChrome`
 * instead: the mark, centred, and one way back.
 *
 * This is a deliberately short list and should stay that way — a route that
 * drops the site's navigation has to earn it by being a single-purpose flow,
 * not by being important. `SiteHeader` is the only consumer; the footer still
 * renders everywhere, so no page is ever a dead end.
 */
export function hidesSiteChrome(pathname: string): boolean {
  return pathname === "/waitlist";
}

/**
 * Routes that close with the waitlist call to action — an **allowlist**.
 *
 * ## Why it is stated the other way round (owner direction, 2026-08-08)
 *
 * It used to be a suppression list: the footer asked on every route and six
 * opted out, so the ask ran under the legal pages, the safety page, the
 * contact page and the journal index. That is the wrong default. The header
 * carries "Join Waitlist" on every page already, so a visitor who wants it is
 * one glance away wherever they are — and a full-width act repeating the same
 * ask underneath every page reads as a site that does not trust its own
 * navigation. Asked constantly it stops being an invitation and starts being
 * pressure.
 *
 * So it is asked where the ask is **earned**: at the foot of a page somebody
 * chose to read to the bottom, about one specific place or one specific idea,
 * that has no conversion of its own.
 *
 * - **A destination page** (`/destinations/<slug>`) — somebody reading about
 *   Havelock is deciding whether to go there. The waitlist is the next step of
 *   the thing they are already doing.
 * - **A journal post** (`/journal/<slug>`) — somebody who finished the piece.
 *
 * The journal *index* is excluded on purpose: a list is browsing, not
 * finishing. Everything else says nothing at the foot of the page, because the
 * routes that convert already do it in their own words:
 *
 * | route | how it asks |
 * |---|---|
 * | `/`, `/go/*` | closes on the registration form itself |
 * | `/waitlist` | is the form |
 * | `/operators` | closes on the application |
 * | `/explore` | its own closing act |
 * | `/about` | explains the company; does not convert |
 * | `/contact` | a conversation, not a conversion |
 * | `/safety`, `/privacy`, `/terms` | nothing to sell on a page of undertakings |
 *
 * **Adding a route here is a design decision, not a routing one.** That is the
 * point of an allowlist: it grows only by a deliberate act, where a
 * suppression list grew silently every time a page was added.
 */
const FOOTER_CTA_ROOTS = ["/destinations/", "/journal/"] as const;

export function showsFooterCta(pathname: string): boolean {
  return FOOTER_CTA_ROOTS.some((root) => {
    if (!pathname.startsWith(root)) return false;
    // A leaf page under the root — not the root itself, not a deeper path.
    const rest = pathname.slice(root.length);
    return rest.length > 0 && !rest.includes("/");
  });
}

/**
 * The footer's one-line description of what Yuvoy is.
 *
 * Consumer language, deliberately. "The experience commerce platform" is how
 * the business is described internally and to investors; it is not what a
 * traveller reading a footer needs to be told.
 */
export const FOOTER_DESCRIPTION =
  "Discover real experiences through videos from the people who run them.";

/**
 * Contact and social channels for the footer.
 *
 * Empty until 2026-08-07, on the rule that publishing an unmonitored address
 * is worse than publishing none. The owner confirmed both of these are read
 * by a person, so the row ships. Social stays out: an account nobody posts to
 * is the same broken promise in a different shape.
 *
 * Derived from `CONTACT_CHANNEL_LIST` so the address and the number exist in
 * exactly one file across the footer, `/contact` and the homepage glance.
 */
export const CONTACT_CHANNELS: { href: string; label: string }[] =
  CONTACT_CHANNEL_LIST.map((channel) => ({
    href: channel.href,
    label: channel.value,
  }));
