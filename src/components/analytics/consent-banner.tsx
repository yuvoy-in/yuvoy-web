"use client";

import Link from "next/link";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { useAnalytics } from "@/components/analytics/analytics-provider";

/**
 * The consent prompt.
 *
 * A `role="dialog"` region rather than a modal: it must not trap a visitor who
 * came to read the page, and declining is a first-class button rather than a
 * hidden "manage preferences" path. It appears only when a PostHog project is
 * actually configured — asking permission for tracking that does not exist
 * would be theatre.
 */
export function ConsentBanner() {
  const { promptOpen, accept, decline, consent, closePrompt } = useAnalytics();
  const headingId = React.useId();

  if (!promptOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby={headingId}
      className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4 sm:px-6 sm:pb-6"
    >
      <div className="border-cream-line bg-cream rounded-edge mx-auto max-w-3xl border p-6 shadow-lg sm:p-8">
        <h2
          id={headingId}
          className="font-display text-forest tracking-display text-lg font-normal"
        >
          Help us understand what&rsquo;s working?
        </h2>
        <p className="text-forest/75 mt-3 text-sm leading-relaxed">
          We&rsquo;d like to measure which parts of this site lead people to
          join the waitlist. It is anonymous (no name, email or number is ever
          sent) and nothing runs unless you say yes. Read the{" "}
          <Link
            href="/privacy"
            className="text-forest underline underline-offset-2"
          >
            Privacy Policy
          </Link>
          .
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button type="button" onClick={accept} className="w-full sm:w-auto">
            Allow analytics
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={decline}
            className="w-full sm:w-auto"
          >
            No thanks
          </Button>
          {/* Only offered once a decision exists to fall back on. */}
          {consent !== "unset" && (
            <Button
              type="button"
              variant="ghost"
              onClick={closePrompt}
              className="w-full sm:w-auto"
            >
              Close
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * The footer's "Privacy choices" control — the revocation path.
 *
 * Consent has to be as easy to withdraw as it was to give, so this is present
 * on every page and reopens the same prompt.
 */
export function PrivacyChoices() {
  const { configured, openPrompt } = useAnalytics();
  if (!configured) return null;

  return (
    <button
      type="button"
      onClick={openPrompt}
      className="label tap-target text-cream/70 hover:text-cream text-left transition-colors duration-200"
    >
      Privacy choices
    </button>
  );
}
