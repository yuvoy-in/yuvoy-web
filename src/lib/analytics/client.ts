import type { AnalyticsEvent } from "@/lib/analytics/events";
import {
  analyticsConfigured,
  apiHost,
  projectKey,
} from "@/lib/analytics/config";

/*
  Re-exported so the existing callers do not have to know the predicate moved.
  It lives in `config.ts` now because /privacy needs it too, and a server
  component asking "is analytics on" must not drag the PostHog loader in.
*/
export { analyticsConfigured } from "@/lib/analytics/config";

/**
 * The PostHog client, loaded only after explicit consent.
 *
 * ## Why the SDK is imported dynamically
 *
 * Gating `capture()` calls would not be enough. The SDK itself phones home on
 * initialisation, so merely *bundling and initialising* it before consent would
 * put a request on the wire that the visitor never agreed to. Importing it
 * lazily means that before consent there is no PostHog code running at all —
 * which is what "no analytics unless you opt in" has to mean to be true.
 *
 * ## Ordering
 *
 * Opting in must initialise the client **before** the consent event is fired,
 * or there is nothing listening to record it. Revoking must fire the event and
 * flush **while the client still exists**, and only then opt it out. Both
 * orderings live in `grant()` and `revoke()` so no caller has to remember them.
 */

type PostHog = typeof import("posthog-js").default;

let client: PostHog | null = null;
let loading: Promise<PostHog | null> | null = null;

async function load(): Promise<PostHog | null> {
  if (client) return client;
  if (!analyticsConfigured()) return null;

  loading ??= import("posthog-js").then((mod) => {
    const posthog = mod.default;
    posthog.init(projectKey(), {
      api_host: apiHost(),
      // Consent is ours to manage; the SDK must never decide for itself.
      persistence: "localStorage",
      autocapture: false,
      capture_pageview: false,
      capture_pageleave: false,
      disable_session_recording: true,
      // No visitor is ever identified: there is no join key to a lead row.
      person_profiles: "never",
    });
    client = posthog;
    return posthog;
  });

  return loading;
}

/**
 * Grant consent: initialise first, then record the grant. Firing the event
 * before initialising would drop it — there would be nothing listening.
 */
export async function grant(event: AnalyticsEvent): Promise<void> {
  const posthog = await load();
  if (!posthog) return;
  posthog.opt_in_capturing();
  posthog.capture(event.name, event.payload);
}

/**
 * Revoke consent: record the revocation and flush it while the client still
 * exists, then stop all further capture. The order is the point.
 */
export function revoke(event: AnalyticsEvent): void {
  if (!client) return;
  // send_instantly: the next statement stops capture, so a queued event would
  // never leave the browser.
  client.capture(event.name, event.payload, { send_instantly: true });
  client.opt_out_capturing();
  client.reset();
}

/** Capture an event. A no-op unless the client is loaded and opted in. */
export function capture(event: AnalyticsEvent): void {
  if (!client || client.has_opted_out_capturing()) return;
  client.capture(event.name, event.payload);
}

/** Test seam — resets module state between cases. */
export function __resetForTests(): void {
  client = null;
  loading = null;
}
