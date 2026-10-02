/**
 * Where Yuvoy actually is, stated once.
 *
 * The launch position used to be re-typed into every page, which is how a
 * site ends up apologising for itself in six different wordings. It lives here
 * instead: one status line and one label per destination. Everything that
 * needs to say it imports it.
 *
 * **Rule: a page states the position at most once**, and only where it
 * changes what the visitor should do. It is not a disclaimer to be stapled
 * under every section.
 *
 * ## Open, and true on both sides of the invite gate (yuvoy-web#170)
 *
 * Until this change the site said booking was not live, while the app took
 * bookings. It now says what is true: Yuvoy is open in Havelock. The app is
 * due to ask for an invite to book (yuvoy-api#195), so nothing here says
 * anyone can book right now, and nothing says you cannot (owner's call, 25
 * Sep 2026). What is running, and how to book it, is the app's to say.
 */

/**
 * How far along a destination is. Andaman is the first market, not the shape
 * of the platform, and the statuses exist so a second market is a data entry
 * rather than a redesign.
 *
 * `not-open` replaced `first-launch` (yuvoy-web#170): with Havelock open,
 * "First launch" on Neil's page read as "Neil is open too", and nothing in
 * Neil is on Yuvoy yet.
 */
export type LaunchStatus = "not-open" | "opening-soon" | "onboarding" | "live";

export const LAUNCH_STATUS_LABEL: Record<LaunchStatus, string> = {
  "not-open": "Not open yet",
  "opening-soon": "Opening soon",
  onboarding: "Onboarding",
  live: "Open now",
};

/**
 * The one-line position, in two lengths.
 *
 * `full` carries the phase; `short` is what a phone shows, where the middot
 * chain would wrap into a paragraph. They must agree: if what is open
 * changes, both change together.
 */
export const ANNOUNCEMENT = {
  full: "Season One · Open in Havelock, Andaman Islands",
  short: "Open in Havelock, in the Andaman Islands",
} as const;

/** The footer's standing status line. Facts only: no dates, no counts. */
export const FOOTER_STATUS = "Open in Havelock, in the Andaman Islands.";

/** What the destinations section says about what comes after Havelock. */
export const EXPANSION_STATUS =
  "Open in Havelock · More destinations joining later";

/*
  `OPERATOR_FORM_LIVE` used to live here, false, because the deployed API still
  required "where do you operate?", "what do you offer?" and a WhatsApp number
  that the public form had stopped asking for — so a complete, valid
  application was answered `400`.

  That shipped on 2026-08-07 (yuvoy-in/yuvoy-api#4, verified against production
  with the exact email-only payload this form sends), and the flag was deleted
  along with the "Coming soon" notice it gated, rather than left behind at
  `true`: a permanent flag is a permanent question about which half of the code
  is real.
*/
