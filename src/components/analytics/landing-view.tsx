"use client";

import * as React from "react";
import { useAnalytics } from "@/components/analytics/analytics-provider";
import { landingViewed, type RouteType } from "@/lib/analytics/events";
import type { LeadSource } from "@/lib/leads/registry";

/**
 * Records a landing view — the top of the funnel.
 *
 * Renders nothing. It reports a **route type**, never a URL: a URL can carry
 * query strings a visitor pasted, and the funnel only needs to know which kind
 * of page this was.
 *
 * Fires once per mount, and only after consent — before that `capture` is a
 * no-op, and the event is not queued for later replay.
 */
export function LandingView({
  routeType,
  source,
  marketKey,
  destinationKey,
}: {
  routeType: RouteType;
  source: LeadSource;
  marketKey: string;
  destinationKey: string;
}) {
  const { capture, consent } = useAnalytics();
  const reported = React.useRef(false);

  React.useEffect(() => {
    if (reported.current || consent !== "granted") return;
    reported.current = true;
    capture(landingViewed({ routeType, source, marketKey, destinationKey }));
  }, [capture, consent, routeType, source, marketKey, destinationKey]);

  return null;
}
