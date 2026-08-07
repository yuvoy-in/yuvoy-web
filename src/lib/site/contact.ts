/**
 * How to reach Yuvoy, stated once.
 *
 * **Every channel here is monitored by a person.** That is the bar, and it is
 * why the footer published no contact row at all until 2026-08-07: an address
 * nobody reads is worse than no address, because it converts a person who
 * wanted to talk to you into a person who thinks you ignored them. Remove an
 * entry the day it stops being read.
 *
 * There is deliberately **no response-time promise** (owner direction). The
 * reference this section was modelled on advertises "usually replies within
 * the hour" and "within 48 hours"; a pre-launch team will eventually miss
 * that, and a missed promise costs more than one never made. The same rule
 * governs launch dates everywhere else on the site.
 *
 * No postal address either. Yuvoy does not take visitors, so publishing one
 * would be decoration with a privacy cost.
 */

export interface ContactChannel {
  key: string;
  label: string;
  /** What the visitor reads. */
  value: string;
  /** What the link does. */
  href: string;
  /** One line on when to use this one rather than the other. */
  note: string;
}

export const CONTACT_EMAIL = "info@yuvoy.in";

/**
 * The WhatsApp number in two forms: E.164 for the link, spaced for reading.
 *
 * `wa.me` takes digits only, with no `+` and no punctuation — anything else
 * silently resolves to "phone number shared via url is invalid", which looks
 * like a broken link rather than a malformed one.
 */
export const CONTACT_WHATSAPP_E164 = "+918121657657";
const WHATSAPP_DIGITS = CONTACT_WHATSAPP_E164.replace(/\D/g, "");

export const CONTACT_CHANNEL_LIST: ContactChannel[] = [
  {
    key: "email",
    label: "Email",
    value: CONTACT_EMAIL,
    href: `mailto:${CONTACT_EMAIL}`,
    note: "General enquiries, and anything with detail to it.",
  },
  {
    key: "whatsapp",
    label: "WhatsApp",
    value: "+91 81216 57657",
    href: `https://wa.me/${WHATSAPP_DIGITS}`,
    note: "Message us directly if that is easier.",
  },
];

/**
 * What a message can be about.
 *
 * **No "a trip or experience" option** (owner direction, 2026-08-07): nothing
 * is bookable, so offering it would invite a question the team cannot answer
 * and imply a product that is not open. It belongs here the day booking does.
 *
 * The values are the shape the backend will store, so they are stable slugs
 * rather than the visible labels — renaming a label must not silently split
 * a category's history in two.
 */
export const CONTACT_TOPICS: { value: string; label: string }[] = [
  { value: "general", label: "General enquiry" },
  { value: "feedback", label: "Feedback" },
  { value: "listing", label: "Listing my business" },
  { value: "partnership", label: "Partnership" },
];

/**
 * Whether the message form can actually send.
 *
 * `POST /v1/messages` does not exist yet (yuvoy-in/yuvoy-api#5). Until it
 * does, the form renders complete but disabled behind a "Coming soon" badge,
 * and the two channels above it carry the traffic — they are live today.
 *
 * **Flip this to `true` in the same change that wires the endpoint**, and
 * delete it once the form has shipped. A permanent flag is a permanent
 * question about which half of the code is real.
 */
export const MESSAGE_FORM_LIVE = false;
