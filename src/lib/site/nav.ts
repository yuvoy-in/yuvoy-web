/**
 * The site's route registry — the single source of truth for navigation.
 *
 * **A route appears here only once its page exists and renders.** The header
 * and footer are both derived from this list, so a link can never point at a
 * route that was planned but never shipped. Each rebuild issue that adds a
 * page adds its own entry here, in the same PR as the page.
 */

/** Which footer column a route belongs to, if any. */
export type FooterColumn = "discover" | "yuvoy" | "trust";

export interface SiteRoute {
  href: string;
  /** Label used in the header nav, the site menu and the footer column. */
  label: string;
  /** Show inline in the desktop (`lg`+) header nav. */
  inHeader?: boolean;
  /** Footer column placement; omit to keep the route out of the footer. */
  footer?: FooterColumn;
}

/**
 * Every navigable route on the site. Order is meaningful — it is the order
 * shown in the header and within each footer column.
 */
export const SITE_ROUTES: SiteRoute[] = [
  // Discover column.
  {
    href: "/experiences",
    label: "Experiences",
    inHeader: true,
    footer: "discover",
  },
  {
    href: "/destinations",
    label: "Destinations",
    inHeader: true,
    footer: "discover",
  },
  { href: "/journal", label: "Journal", footer: "discover" },
  // Yuvoy column.
  {
    href: "/how-it-works",
    label: "How it works",
    inHeader: true,
    footer: "yuvoy",
  },
  {
    href: "/travellers",
    label: "For travellers",
    inHeader: true,
    footer: "yuvoy",
  },
  {
    href: "/operators",
    label: "For operators",
    inHeader: true,
    footer: "yuvoy",
  },
  { href: "/about", label: "About", footer: "yuvoy" },
  { href: "/waitlist", label: "Join the waitlist", footer: "yuvoy" },
  // Trust column.
  { href: "/safety", label: "Safety", footer: "trust" },
  { href: "/privacy", label: "Privacy", footer: "trust" },
  { href: "/terms", label: "Terms", footer: "trust" },
];

/**
 * The desktop header nav, in registry order. From `lg` up these sit inline in
 * the bar — a desktop has the room, and a nav you can see beats one behind a
 * click (owner direction 2026-08-05, reverting the desktop menu concept).
 * Below `lg` the shutter menu carries navigation instead.
 */
export const NAV_ITEMS: { href: string; label: string }[] = SITE_ROUTES.filter(
  (r) => r.inHeader,
).map(({ href, label }) => ({ href, label }));

/**
 * What the site menu lists, in registry order.
 *
 * The menu is the whole of navigation below `lg`, so this is every route
 * except the two that are already on screen while it is open: the legal
 * links, pinned along the bottom of the panel, and the waitlist, which is
 * the panel's call to action.
 */
export const MENU_ITEMS: { href: string; label: string }[] = SITE_ROUTES.filter(
  (r) => r.footer !== "trust" && r.href !== "/waitlist",
).map(({ href, label }) => ({ href, label }));

/**
 * The one route the sub-`lg` header names outright. Travellers are the
 * homepage's audience, so operators get a permanent, centred way out to
 * their own page even where the inline nav does not fit.
 */
export const OPERATOR_NAV = {
  href: "/operators",
  label: "For operators",
} as const;

export const FOOTER_COLUMN_TITLES: Record<FooterColumn, string> = {
  discover: "Discover",
  yuvoy: "Yuvoy",
  trust: "Trust",
};

const FOOTER_ORDER: FooterColumn[] = ["discover", "yuvoy", "trust"];

/**
 * Footer columns, empty ones dropped — an empty column heading reads as a
 * broken page, and the rebuild ships routes column by column.
 */
export const FOOTER_COLUMNS: {
  key: FooterColumn;
  title: string;
  items: { href: string; label: string }[];
}[] = FOOTER_ORDER.map((key) => ({
  key,
  title: FOOTER_COLUMN_TITLES[key],
  items: SITE_ROUTES.filter((r) => r.footer === key).map(({ href, label }) => ({
    href,
    label,
  })),
})).filter((column) => column.items.length > 0);

/**
 * The canonical short-form call to action, repeated in the header, the mobile
 * menu and the footer. The long forms ("Join the traveller waitlist", "Apply
 * as a founding operator") are used where there is room to be specific.
 */
export const PRIMARY_CTA = {
  href: "/waitlist",
  label: "Join waitlist",
} as const;

/**
 * Routes that already end in the registration form.
 *
 * The footer repeats the call to action on every page, which is right almost
 * everywhere — but stacking it directly beneath the form itself reads as a
 * page that does not know what it just asked for. These routes suppress it.
 */
export function endsWithLeadForm(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname === "/waitlist" ||
    pathname === "/operators" ||
    pathname.startsWith("/go/")
  );
}

/**
 * Contact and social channels for the footer.
 *
 * **Deliberately empty.** Publishing an unmonitored address is worse than
 * publishing none — the footer omits the whole row while this is empty. Add
 * entries only for channels a person actually reads.
 */
export const CONTACT_CHANNELS: { href: string; label: string }[] = [];

/**
 * Launch status, shown once in the footer. Facts only — no dates we cannot
 * hold to, no counts, no partner claims.
 */
export const LAUNCH_STATUS =
  "Waitlist open for Havelock, Neil and Port Blair. Booking is not live yet.";
