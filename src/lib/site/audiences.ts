import { OPERATOR_FAQS, WAITLIST_FAQS, type Faq } from "@/lib/site/faqs";
import type { LeadAudience } from "@/lib/leads/registry";

/**
 * What each audience is actually doing, said once.
 *
 * A traveller **joins** something; an operator **applies** to something. Those
 * are two different asks, and until 2026-08-07 `/waitlist` put both of them
 * under one page title ("Join the waitlist") — so an operator who followed the
 * `?audience=provider` link printed on their own materials was told they were
 * joining a waitlist, and only the submit button ever disagreed.
 *
 * The copy for both sides now lives here, in one record, and everything that
 * speaks to an audience reads it: the `/waitlist` page's two tabs, the
 * homepage's closing ask (`JoinAside`), the operator page's application
 * (`ApplyAside`), and the route's `<title>`. That is the point of the file —
 * the wording cannot drift between the four places it appears, because there
 * is only one of it.
 *
 * Truthfulness rules apply to every string here: no dates, no counts, no queue
 * positions, no commercial terms.
 */
export interface AudienceCopy {
  audience: LeadAudience;
  /** The `?audience=` value that opens this side. Part of a printed contract. */
  param: string;
  /**
   * The tab's label. First person, because what the visitor is picking is
   * themselves — "For travellers" labels a brochure, "I'm travelling" answers
   * a question.
   */
  tabLabel: string;
  /** One line naming the act, for the tab's supporting text. */
  tabHint: string;
  eyebrow: string;
  /** The headline, split at the turn: `title` upright, `accent` italic terra. */
  title: string;
  accent: string;
  lede: string;
  /** The questions someone still has *while* filling the form in. */
  faqs: Faq[];
  /** The route's `<title>` while this side is open (" · Yuvoy" is appended). */
  metaTitle: string;
  metaDescription: string;
}

export const AUDIENCE_COPY: Record<LeadAudience, AudienceCopy> = {
  traveller: {
    audience: "traveller",
    param: "traveller",
    tabLabel: "I'm travelling",
    tabHint: "Join the waitlist",
    eyebrow: "Early access",
    title: "Be first to experience",
    accent: "Yuvoy.",
    lede: "Join the waitlist and we will contact you when the first experiences for your destination are ready.",
    faqs: WAITLIST_FAQS,
    metaTitle: "Join the waitlist",
    metaDescription:
      "Join the Yuvoy waitlist for first access to local dives, boat days, food and culture in Havelock, Neil and Port Blair.",
  },
  provider: {
    audience: "provider",
    param: "provider",
    tabLabel: "I run experiences",
    tabHint: "Apply as an operator",
    eyebrow: "Applying",
    title: "Apply as a",
    accent: "founding operator.",
    /*
      The second half used to read "A member of the team reads it and comes
      back to you directly" — the same promise yuvoy-web#150 removed from the
      success notice, on the form above it.

      Nothing kept it: the two operators who used this form in August 2026
      were still waiting a month later, and D-031 P10 retires that review
      queue as work. What replaces it is the thing that is true and useful —
      an operator does not have to wait for anybody, because
      `POST /operator/v1/auth/signup` is open right now.

      Kept short and kept here rather than fetched: this is the lede ABOVE the
      form, before any request has been made, so there is no `next` to render.
      The API's own sentence is what the success notice shows.
    */
    lede: "Tell us who you are, where you operate and what you offer. You do not have to wait for us — you can set your business up at operators.yuvoy.in with the same number.",
    faqs: OPERATOR_FAQS,
    metaTitle: "Apply as a founding operator",
    metaDescription:
      "Apply to list your experiences on Yuvoy as a founding operator. Applying starts a conversation; it does not create a listing or a commercial agreement.",
  },
};

/**
 * Tab order, left to right. Travellers first: they are the larger audience and
 * the default the route opens on.
 */
export const AUDIENCE_ORDER: LeadAudience[] = ["traveller", "provider"];

/**
 * Read an audience out of a URL.
 *
 * **Anything that is not an explicit "provider" is a traveller.** An unknown or
 * hostile value must never 404, blank the page or reach the API — it opens the
 * default side, which is what someone typing a URL by hand deserves.
 */
export function audienceFromParam(value?: string | string[]): LeadAudience {
  return value === AUDIENCE_COPY.provider.param ? "provider" : "traveller";
}
