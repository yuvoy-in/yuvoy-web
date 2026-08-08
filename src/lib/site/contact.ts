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

import type { components } from "@/lib/api/schema";

/** The topics the endpoint accepts. Anything else is a 400. */
type MessageTopic = components["schemas"]["MessageTopic"];

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
 * How long a message may be.
 *
 * 4000 **characters, not bytes** (yuvoy-in/yuvoy-api#5): 4000 multi-byte
 * characters is still 4000 characters, so a message written in Hindi is not
 * silently penalised. Named here rather than typed into the schema and the
 * counter separately — a cap the form and the API disagree about is a
 * rejection after the message has been written.
 */
export const MESSAGE_MAX = 4000;

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
export const CONTACT_TOPICS: { value: MessageTopic; label: string }[] = [
  { value: "general", label: "General enquiry" },
  { value: "feedback", label: "Feedback" },
  { value: "listing", label: "Listing my business" },
  { value: "partnership", label: "Partnership" },
];

/*
  `MESSAGE_FORM_LIVE` used to live here, false, while `POST /v1/messages` did
  not exist. The endpoint shipped on 2026-08-07 (yuvoy-in/yuvoy-api#5) and the
  flag was deleted with the disabled form rather than left behind at `true`: a
  permanent flag is a permanent question about which half of the code is real.
*/
