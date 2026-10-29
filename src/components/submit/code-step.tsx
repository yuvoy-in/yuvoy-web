"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  resendCode,
  verifyCode,
  type Confirmation,
  type Receipt,
} from "@/lib/submit/api";
import { WORDS } from "@/lib/submit/words";
import { FieldError } from "./field-error";

const SIX_DIGITS = /^\d{6}$/;

/**
 * Step two: the 6-digit code from the email.
 *
 * The receipt's `message` is shown as sent ("We sent a 6-digit code to
 * a•••@example.org. It works for 10 minutes."), and a new code replaces it
 * with the new one. The receipt's `id` is the only other thing kept, for the
 * two calls; a reload loses it on purpose, because keeping it would mean
 * keeping the organiser's details in browser storage (point 11 A).
 *
 * A made-up receipt (the trap field, or our hourly ceiling on new addresses)
 * looks exactly like a real one here. Its code and its resend answer `404`,
 * which shows the API's sentence and the way back to the form, like any other
 * submission we cannot find.
 *
 * `409` is not an error to the organiser: the event is with our team, which is
 * what they came to do, so it goes to the done state with the API's sentence
 * and the reference we already hold (point 8 A, issue case 16).
 */
export function CodeStep({
  receipt,
  online,
  onConfirmed,
  onBack,
}: {
  receipt: Receipt;
  online: boolean;
  onConfirmed: (confirmation: Confirmation) => void;
  onBack: () => void;
}) {
  const [id, setId] = React.useState(receipt.id);
  const [message, setMessage] = React.useState(receipt.message);
  const [code, setCode] = React.useState("");
  const [codeError, setCodeError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  /** The action the API asked us to hold back, and for how long. */
  const [blocked, setBlocked] = React.useState<{
    action: "confirm" | "resend";
    seconds: number;
  } | null>(null);
  const inFlight = React.useRef(false);
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const codeRef = React.useRef<HTMLInputElement>(null);

  // Arriving here is a new step: say so to a screen reader by moving focus.
  React.useEffect(() => {
    headingRef.current?.focus();
  }, []);

  React.useEffect(() => {
    if (!blocked) return;
    const timer = setTimeout(() => setBlocked(null), blocked.seconds * 1000);
    return () => clearTimeout(timer);
  }, [blocked]);

  /** What every call shares once it is answered and not done. */
  function answered(
    res:
      | { kind: "gone" | "paused"; message: string }
      | { kind: "throttled"; message: string; retryAfter?: number }
      | { kind: "offline" }
      | { kind: "failed"; message?: string },
    action: "confirm" | "resend",
  ) {
    switch (res.kind) {
      case "gone":
      case "paused":
        setNotice(res.message);
        return;
      case "throttled":
        setNotice(res.message || WORDS.failed);
        if (res.retryAfter) {
          setBlocked({ action, seconds: res.retryAfter });
        }
        return;
      case "offline":
        // The offline line says it, from the browser's own state.
        setNotice(null);
        return;
      case "failed":
        setNotice(res.message ?? WORDS.failed);
        return;
    }
  }

  async function confirm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;

    // Spaces from a pasted "123 456" are not part of the code.
    const typed = code.replace(/\s/g, "");
    if (!SIX_DIGITS.test(typed)) {
      setCodeError(WORDS.errors.code);
      codeRef.current?.focus();
      return;
    }

    setCodeError(null);
    setNotice(null);
    inFlight.current = true;
    setBusy(true);
    const res = await verifyCode(id, typed);
    inFlight.current = false;
    setBusy(false);

    switch (res.kind) {
      case "confirmed":
        onConfirmed({
          reference: res.confirmation.reference || receipt.reference,
          message: res.confirmation.message,
        });
        return;
      case "with_team":
        onConfirmed({ reference: receipt.reference, message: res.message });
        return;
      case "invalid":
        setCodeError(res.fields.code ?? res.message ?? WORDS.errors.code);
        codeRef.current?.focus();
        return;
      case "wrong_code":
        // Each try counts, so the box is emptied for the next one.
        setNotice(res.message);
        setCode("");
        codeRef.current?.focus();
        return;
      default:
        answered(res, "confirm");
    }
  }

  async function resend() {
    if (inFlight.current) return;
    setNotice(null);
    setCodeError(null);
    inFlight.current = true;
    setBusy(true);
    const res = await resendCode(id);
    inFlight.current = false;
    setBusy(false);

    switch (res.kind) {
      case "sent":
        setId(res.receipt.id);
        if (res.receipt.message) setMessage(res.receipt.message);
        setCode("");
        return;
      case "with_team":
        onConfirmed({ reference: receipt.reference, message: res.message });
        return;
      default:
        answered(res, "resend");
    }
  }

  const off = busy || !online;

  return (
    <section aria-labelledby="submit-code-heading" className="mt-8">
      <h2
        id="submit-code-heading"
        ref={headingRef}
        tabIndex={-1}
        className="font-display text-forest tracking-display text-2xl font-normal focus:outline-none"
      >
        {WORDS.code.heading}
      </h2>
      {/* Polite, so a new code's message is read when it replaces this one. */}
      <p aria-live="polite" className="text-forest/75 mt-4 leading-relaxed">
        {message}
      </p>

      <form
        onSubmit={confirm}
        noValidate
        aria-busy={busy}
        className="mt-8 flex flex-col gap-6"
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor="submit-code" className="label text-forest/75">
            {WORDS.code.label}
          </label>
          <Input
            ref={codeRef}
            id="submit-code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            aria-invalid={!!codeError}
            aria-describedby={codeError ? "submit-code-error" : undefined}
            className="tracking-label max-w-48"
          />
          <FieldError id="submit-code-error" message={codeError ?? undefined} />
        </div>

        {notice && (
          <p
            role="alert"
            className="border-terra-deep/40 rounded-edge text-forest border p-4 text-sm leading-relaxed"
          >
            {notice}
          </p>
        )}

        {!online && (
          <p role="status" className="text-forest/75 text-sm">
            {WORDS.offline}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-4">
          <Button
            type="submit"
            size="lg"
            disabled={off || blocked?.action === "confirm"}
          >
            {WORDS.code.confirm}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={resend}
            disabled={off || blocked?.action === "resend"}
          >
            {WORDS.code.resend}
          </Button>
        </div>
      </form>

      {/*
        Always here, not only after a 404: the event is kept, and an
        organiser who spots a mistake in it should not need an error to get
        back to it.
      */}
      <Button type="button" variant="ghost" className="mt-6" onClick={onBack}>
        {WORDS.code.back}
      </Button>
    </section>
  );
}
