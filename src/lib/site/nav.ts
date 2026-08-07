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
 * menu and the footer. The long forms ("Join the waitlist", "Apply as a
 * founding operator") are used where there is room to be specific.
 */
export const PRIMARY_CTA = {
  href: "/waitlist",
  label: "Join Waitlist",
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
 * Routes that suppress the footer's closing call to action.
 *
 * The footer repeats the ask on every page, which is right almost everywhere.
 * Two kinds of route opt out, for two different reasons:
 *
 * 1. **They already made the ask.** `/`, `/waitlist`, `/operators`, `/explore`
 *    and the campaign routes all end in a form or a call to action of their
 *    own, and stacking a second one directly beneath reads as a page that has
 *    lost track of what it just said.
 * 2. **The ask does not belong there.** `/about` (owner direction,
 *    2026-08-07). Its job is to explain the company, not to convert, and it
 *    carried "Join the waitlist" twice — once in its own status section, once
 *    in the footer's — inside a single scroll. The header carries the call to
 *    action on every route regardless.
 */
export function suppressesFooterCta(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname === "/waitlist" ||
    pathname === "/operators" ||
    pathname === "/explore" ||
    pathname === "/about" ||
    pathname.startsWith("/go/")
  );
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
