/**
 * Where Yuvoy actually is, stated once.
 *
 * The pre-launch position used to be re-typed into every page, which is how a
 * site ends up apologising for itself in six different wordings. It lives here
 * instead: one status line, one plain sentence about booking, and one label
 * for the phase. Everything that needs to say it imports it.
 *
 * **Rule: a page states the pre-launch position at most once**, and only where
 * it changes what the visitor should do. It is not a disclaimer to be stapled
 * under every section.
 */

/**
 * How far along a destination is. Andaman is the first launch, not the shape
 * of the platform — the later statuses exist so a second market is a data
 * entry rather than a redesign.
 */
export type LaunchStatus =
  "first-launch" | "opening-soon" | "onboarding" | "live";

export const LAUNCH_STATUS_LABEL: Record<LaunchStatus, string> = {
  "first-launch": "First launch",
  "opening-soon": "Opening soon",
  onboarding: "Onboarding",
  live: "Live",
};

/**
 * The one-line launch position, in three lengths.
 *
 * `full` carries the phase; `short` is what a phone shows, where the middot
 * chain would wrap into a paragraph. They must agree — if the launch market
 * changes, both change together.
 */
export const ANNOUNCEMENT = {
  full: "Season One · Opening first in the Andaman Islands · Waitlist open",
  short: "Opening first in the Andaman Islands",
} as const;

/**
 * The site-wide truth about booking, in one sentence.
 *
 * Used by the cover and by the pages where it materially affects what a
 * visitor can do. Never repeat it inside a page that already carries it.
 */
export const BOOKING_STATUS =
  "Booking is not live yet. Join the waitlist for first access.";

/** The footer's standing status line. Facts only: no dates, no counts. */
export const FOOTER_STATUS = "Opening first in the Andaman Islands.";

/** What the first-launch section says about what comes after Andaman. */
export const EXPANSION_STATUS =
  "First launch now being prepared · More destinations joining later";

/**
 * Whether the founding-operator application can actually be submitted.
 *
 * **False, and this is not a design choice.** The public form stopped asking
 * "Where do you operate?" and "What do you offer?" on 2026-08-07 (owner
 * direction), and stopped requiring a WhatsApp number in the same change. The
 * deployed API still marks all three required on a provider lead, so a
 * complete, valid application is answered with a 400.
 *
 * Given the choice between a form that silently rejects every operator who
 * fills it in and an honest "coming soon" beside two channels that reach a
 * person today, the second is the only defensible one.
 *
 * **Flip this to `true` when `yuvoy-in/yuvoy-api#4` deploys**, and delete it
 * once the form has shipped — a permanent flag is a permanent question about
 * which half of the code is real. The traveller waitlist is unaffected and
 * works today: everything it sends is already accepted.
 */
export const OPERATOR_FORM_LIVE = false;
