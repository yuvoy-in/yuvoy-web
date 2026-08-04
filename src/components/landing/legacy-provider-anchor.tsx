"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

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
 */
export function LegacyProviderAnchor() {
  const router = useRouter();

  React.useEffect(() => {
    function redirectIfLegacyAnchor() {
      if (window.location.hash === "#providers") {
        router.replace("/operators#apply");
      }
    }
    redirectIfLegacyAnchor();
    window.addEventListener("hashchange", redirectIfLegacyAnchor);
    return () =>
      window.removeEventListener("hashchange", redirectIfLegacyAnchor);
  }, [router]);

  return null;
}
