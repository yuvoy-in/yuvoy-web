/**
 * Whether analytics is configured, and where it would send data.
 *
 * Split out of `client.ts` so that anything can ask these questions without
 * pulling the PostHog loader into its module graph — the privacy page is a
 * server component and has no business reaching a browser SDK to find out what
 * it should say about itself.
 *
 * That is the point of this file rather than a tidiness argument. The privacy
 * page describes what actually runs, and it derives that description from the
 * same values the code branches on — so it cannot claim analytics are off
 * while they are on, or promise the EU while pointing somewhere else, because
 * the claim is not written down twice.
 */

/** EU-hosted by default: visitor data stays in the EU. */
export const DEFAULT_HOST = "https://eu.i.posthog.com";

/** PostHog's EU ingestion hosts. Anything else is not the EU. */
const EU_HOSTS = ["eu.i.posthog.com", "eu.posthog.com"];

export function projectKey(): string {
  return process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "";
}

export function apiHost(): string {
  return process.env.NEXT_PUBLIC_POSTHOG_HOST || DEFAULT_HOST;
}

/**
 * Whether analytics is configured at all.
 *
 * With no project key there is nothing to consent to, so the consent UI is not
 * shown and nothing is captured. Asking a visitor to approve tracking that does
 * not exist would be theatre.
 */
export function analyticsConfigured(): boolean {
  return projectKey().length > 0;
}

/**
 * Whether the configured host is one of PostHog's EU ones.
 *
 * `/privacy` promises "hosted in the EU", and that promise is only true of the
 * DEFAULT. `NEXT_PUBLIC_POSTHOG_HOST` can point anywhere, so the claim is
 * derived rather than written — a US project key with the host overridden to
 * match would otherwise leave a privacy page stating something false, with
 * nothing in the codebase disagreeing.
 *
 * Unparseable hosts answer `false`. A host we cannot read is not a host we can
 * make a promise about.
 */
export function analyticsHostedInEu(): boolean {
  try {
    return EU_HOSTS.includes(new URL(apiHost()).hostname.toLowerCase());
  } catch {
    return false;
  }
}
