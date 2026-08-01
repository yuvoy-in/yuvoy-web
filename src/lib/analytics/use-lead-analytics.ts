"use client";

import * as React from "react";
import { useAnalytics } from "@/components/analytics/analytics-provider";
import * as events from "@/lib/analytics/events";
import type {
  InterestGroup,
  LeadAudience,
  LeadSource,
} from "@/lib/leads/registry";
import type { SubmitResult } from "@/lib/leads/api";

/**
 * Funnel instrumentation for the lead forms.
 *
 * The point of putting this behind a hook is that **no call site ever
 * constructs an event payload**. Form components hold names, phone numbers and
 * email addresses; if they built payloads inline, one careless spread would
 * put a visitor's contact details into analytics. Here they hand over only
 * what is safe, and the builders in `events.ts` decide the shape.
 *
 * `lead_form_started` fires once per form instance, on first interaction —
 * not on render, which would make every page view look like a form start.
 */
export function useLeadAnalytics(audience: LeadAudience, source: LeadSource) {
  const { capture } = useAnalytics();
  const started = React.useRef(false);

  const formStarted = React.useCallback(() => {
    if (started.current) return;
    started.current = true;
    capture(events.leadFormStarted({ audience, source }));
  }, [capture, audience, source]);

  const validationFailed = React.useCallback(
    (fields: string[]) => {
      if (fields.length === 0) return;
      // Field *names* only — never the values that failed.
      capture(events.leadFormValidationFailed({ audience, fields }));
    },
    [capture, audience],
  );

  const destinationChanged = React.useCallback(
    (from: string, to: string) => {
      if (from === to) return;
      capture(events.destinationChanged({ from, to }));
    },
    [capture],
  );

  const submitted = React.useCallback(
    (input: {
      marketKey: string;
      destinationKeys: string[];
      interests: InterestGroup[];
    }) => {
      capture(events.leadSubmitted({ audience, source, ...input }));
    },
    [capture, audience, source],
  );

  const submissionFailed = React.useCallback(
    (result: SubmitResult) => {
      if (result.kind === "recorded" || result.kind === "updated") return;
      capture(
        events.leadSubmissionFailed({
          audience,
          // The API client has already classified this. The raw server message
          // never reaches analytics — it can contain echoed input.
          code: result.kind,
        }),
      );
    },
    [capture, audience],
  );

  return {
    formStarted,
    validationFailed,
    destinationChanged,
    submitted,
    submissionFailed,
  };
}
