import type {
  InterestGroup,
  LeadAudience,
  LeadSource,
} from "@/lib/leads/registry";

/**
 * The ratified event taxonomy.
 *
 * **This list is closed.** Adding or renaming an event is a decision to raise
 * before it is a change to make — a funnel is only readable if its shape holds
 * still. The properties are as ratified, and no more.
 *
 * ## The rule that matters
 *
 * **No event payload may ever contain personally identifying data**: no name,
 * no email, no phone or WhatsApp number, no lead ID, no free text a visitor
 * typed. Destination, market and interest values are *keys* from the registry
 * (`andaman/havelock`, `diving_water`), never contact details.
 *
 * This is why every payload is built by a named function here rather than
 * assembled at the call site: there is one place to audit, and a unit test
 * asserts none of them can emit an email-, phone- or UUID-shaped value.
 *
 * There is deliberately **no join key between an event and a lead row**. The
 * bottom of the funnel — contactable and qualified leads — is a database
 * query against `leads.status`, stitched to this funnel in a dashboard. Do not
 * "complete" the funnel by adding an identifier to events.
 */
export const EVENTS = {
  landingViewed: "landing_viewed",
  destinationChanged: "destination_changed",
  audienceSelected: "audience_selected",
  mediaPreviewed: "media_previewed",
  leadFormStarted: "lead_form_started",
  leadFormValidationFailed: "lead_form_validation_failed",
  leadSubmitted: "lead_submitted",
  leadSubmissionFailed: "lead_submission_failed",
  analyticsConsentChanged: "analytics_consent_changed",
} as const;

export type EventName = (typeof EVENTS)[keyof typeof EVENTS];

export type EventPayload = Record<string, string | number | boolean | string[]>;

export interface AnalyticsEvent {
  name: EventName;
  payload: EventPayload;
}

/** Which kind of route the visitor landed on. Not the URL — a URL can carry PII. */
export type RouteType = "home" | "campaign" | "waitlist" | "content";

export function landingViewed(input: {
  routeType: RouteType;
  source: LeadSource;
  marketKey: string;
  destinationKey: string;
}): AnalyticsEvent {
  return {
    name: EVENTS.landingViewed,
    payload: {
      route_type: input.routeType,
      source: input.source,
      market_key: input.marketKey,
      destination_key: input.destinationKey,
    },
  };
}

export function destinationChanged(input: {
  from: string;
  to: string;
}): AnalyticsEvent {
  return {
    name: EVENTS.destinationChanged,
    payload: { from_destination_key: input.from, to_destination_key: input.to },
  };
}

export function audienceSelected(input: {
  audience: LeadAudience;
  /** Where the choice came from, so the three trigger points stay separable. */
  trigger: "tab" | "cta" | "query_param";
}): AnalyticsEvent {
  return {
    name: EVENTS.audienceSelected,
    payload: { audience: input.audience, trigger: input.trigger },
  };
}

export function mediaPreviewed(input: {
  contentId: string;
  mediaType: "video" | "image";
}): AnalyticsEvent {
  return {
    name: EVENTS.mediaPreviewed,
    payload: { content_id: input.contentId, media_type: input.mediaType },
  };
}

export function leadFormStarted(input: {
  audience: LeadAudience;
  source: LeadSource;
}): AnalyticsEvent {
  return {
    name: EVENTS.leadFormStarted,
    payload: { audience: input.audience, source: input.source },
  };
}

export function leadFormValidationFailed(input: {
  audience: LeadAudience;
  /** Field *names* only. Never the value the visitor typed. */
  fields: string[];
}): AnalyticsEvent {
  return {
    name: EVENTS.leadFormValidationFailed,
    payload: { audience: input.audience, fields: [...input.fields].sort() },
  };
}

export function leadSubmitted(input: {
  audience: LeadAudience;
  source: LeadSource;
  marketKey: string;
  destinationKeys: string[];
  interests: InterestGroup[];
}): AnalyticsEvent {
  return {
    name: EVENTS.leadSubmitted,
    payload: {
      audience: input.audience,
      source: input.source,
      market_key: input.marketKey,
      destination_keys: [...input.destinationKeys].sort(),
      interests: [...input.interests].sort(),
    },
  };
}

/** The classified outcome from the API client — never a raw server message. */
export type SubmissionErrorCode =
  "invalid" | "rate_limited" | "unavailable" | "offline";

export function leadSubmissionFailed(input: {
  audience: LeadAudience;
  code: SubmissionErrorCode;
}): AnalyticsEvent {
  return {
    name: EVENTS.leadSubmissionFailed,
    payload: { audience: input.audience, error_code: input.code },
  };
}

export function analyticsConsentChanged(granted: boolean): AnalyticsEvent {
  return {
    name: EVENTS.analyticsConsentChanged,
    payload: { granted },
  };
}
