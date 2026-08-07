"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { operatorHref, type LeadSource } from "@/lib/leads/registry";

/**
 * Keeps `/#providers` coherent now that the homepage is travellers-only.
 *
 * That anchor is a long-lived contract: `/waitlist` was once a permanent (308)
 * redirect onto it, browsers cache 308s indefinitely, and the URL was printed
 * on operator materials. The homepage no longer carries an operator form, so
 * rather than leave the anchor pointing at nothing, it sends the visitor to
 * the application itself.
 *
 * `replace`, not `push`: the homepage was never where they meant to land, so
 * it should not sit in their history waiting for the back button.
 *
 * ## The source has to survive the hop (yuvoy-web#70)
 *
 * This redirect dropped the campaign source for three days. An operator who
 * scanned a printed ferry QR landed on `/go/ferry#providers`, was sent here to
 * `/operators`, and applied — and the lead was written as organic `web`
 * traffic, because the destination page hardcoded it. Silent, and
 * unrecoverable: a client-side `replace` leaves no referrer, so nothing
 * downstream can work out afterwards which QR it was.
 *
 * The source is taken as a prop rather than re-derived from the URL because
 * `Landing` already holds the validated context — re-parsing the pathname here
 * would be a second implementation of a rule that has to agree with the first.
 */
export function LegacyProviderAnchor({ source }: { source: LeadSource }) {
  const router = useRouter();

  React.useEffect(() => {
    function redirectIfLegacyAnchor() {
      if (window.location.hash === "#providers") {
        router.replace(operatorHref(source, "#apply"));
      }
    }
    redirectIfLegacyAnchor();
    window.addEventListener("hashchange", redirectIfLegacyAnchor);
    return () =>
      window.removeEventListener("hashchange", redirectIfLegacyAnchor);
  }, [router, source]);

  return null;
}
