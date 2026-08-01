"use client";

import * as React from "react";
import {
  analyticsConfigured,
  capture as captureEvent,
  grant,
  revoke,
} from "@/lib/analytics/client";
import {
  getConsentServerSnapshot,
  getConsentSnapshot,
  setConsent,
  subscribeConsent,
  type ConsentState,
} from "@/lib/analytics/consent";
import {
  analyticsConsentChanged,
  type AnalyticsEvent,
} from "@/lib/analytics/events";

interface AnalyticsContextValue {
  consent: ConsentState;
  /** True when a project is configured — otherwise there is nothing to consent to. */
  configured: boolean;
  /** Whether the consent prompt should be on screen. */
  promptOpen: boolean;
  openPrompt: () => void;
  closePrompt: () => void;
  accept: () => void;
  decline: () => void;
  capture: (event: AnalyticsEvent) => void;
}

const AnalyticsContext = React.createContext<AnalyticsContextValue | null>(
  null,
);

/** False during server render, true once hydrated. No effect, no state. */
const subscribeNothing = () => () => {};
const alwaysHydrated = () => true;
const neverOnServer = () => false;

/**
 * Owns consent and is the only route to `capture()`.
 *
 * Nothing is loaded, initialised or sent before consent — see the client for
 * why the SDK import itself is deferred rather than just its calls.
 */
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const configured = analyticsConfigured();
  const [dismissed, setDismissed] = React.useState(false);
  const [reopened, setReopened] = React.useState(false);

  const consent = React.useSyncExternalStore(
    subscribeConsent,
    getConsentSnapshot,
    getConsentServerSnapshot,
  );
  const hydrated = React.useSyncExternalStore(
    subscribeNothing,
    alwaysHydrated,
    neverOnServer,
  );

  // A visitor who granted consent on an earlier visit needs the client brought
  // back up on this page load. No consent event is fired: they are not making
  // a decision here, we are resuming one they already made.
  React.useEffect(() => {
    if (consent !== "granted") return;
    void grant(analyticsConsentChanged(true)).catch(() => {});
  }, [consent]);

  const accept = React.useCallback(() => {
    setConsent("granted");
    setReopened(false);
    // Initialise, then record — firing first would have nothing listening.
    void grant(analyticsConsentChanged(true)).catch(() => {});
  }, []);

  const decline = React.useCallback(() => {
    // Record the revocation while the client still exists, then stop capture.
    revoke(analyticsConsentChanged(false));
    setConsent("denied");
    setReopened(false);
  }, []);

  const capture = React.useCallback(
    (event: AnalyticsEvent) => {
      if (consent !== "granted") return;
      captureEvent(event);
    },
    [consent],
  );

  const value = React.useMemo<AnalyticsContextValue>(
    () => ({
      consent,
      configured,
      promptOpen:
        configured &&
        hydrated &&
        (reopened || (consent === "unset" && !dismissed)),
      openPrompt: () => setReopened(true),
      closePrompt: () => {
        setReopened(false);
        setDismissed(true);
      },
      accept,
      decline,
      capture,
    }),
    [
      consent,
      configured,
      hydrated,
      reopened,
      dismissed,
      accept,
      decline,
      capture,
    ],
  );

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}

/**
 * Analytics access for components.
 *
 * Returns a no-op outside the provider rather than throwing: a missing
 * provider must never take a page down, and silence is the correct fallback
 * for analytics specifically.
 */
export function useAnalytics(): AnalyticsContextValue {
  const context = React.useContext(AnalyticsContext);
  return context ?? NOOP;
}

const NOOP: AnalyticsContextValue = {
  consent: "unset",
  configured: false,
  promptOpen: false,
  openPrompt: () => {},
  closePrompt: () => {},
  accept: () => {},
  decline: () => {},
  capture: () => {},
};
