/**
 * Who a waitlist visitor is. Carried on `/waitlist?audience=…` so a provider
 * arriving from a provider CTA doesn't land on traveller-only copy.
 */
export type WaitlistAudience = "traveller" | "provider";

/** Unknown or absent values fall back to traveller — the default path. */
export function parseAudience(value?: string): WaitlistAudience {
  return value === "provider" ? "provider" : "traveller";
}

/** Canonical href for the provider entry point. */
export const PROVIDER_WAITLIST_HREF = "/waitlist?audience=provider";
