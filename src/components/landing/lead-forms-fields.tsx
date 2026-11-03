"use client";

import * as React from "react";
import { Controller, useWatch, type Control } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneField } from "@/components/ui/phone-field";
import { appHref } from "@/lib/site/product-links";
import type { SubmitResult } from "@/lib/leads/api";
import { formatForDisplay } from "@/lib/contact/phone";
import { suggestEmail } from "@/lib/contact/email";
import type { LeadAudience } from "@/lib/leads/registry";
import type { TravellerValues, ProviderValues } from "./lead-forms-schema";

/* ------------------------------------------------------------- outcome UI */

export function OutcomeNotice({
  result,
  onRetry,
}: {
  result: Extract<
    SubmitResult,
    { kind: "rate_limited" | "unavailable" | "offline" }
  >;
  onRetry: () => void;
}) {
  const copy = {
    rate_limited: {
      title: "Too many attempts just now.",
      body: "Give it a minute and try again; your details weren't saved yet.",
    },
    unavailable: {
      title: "We couldn't save that.",
      body: "Something on our side isn't answering. Nothing was recorded, so please try again shortly.",
    },
    offline: {
      title: "You look offline.",
      body: "Check your connection and try again; nothing was sent.",
    },
  }[result.kind];

  return (
    <div role="alert" className="border-terra-soft/40 rounded-edge border p-6">
      <p className="font-display tracking-display text-xl font-normal">
        {copy.title}
      </p>
      <p className="text-paper/70 mt-2 text-sm">{copy.body}</p>
      <Button
        type="button"
        variant="outlineOnDark"
        size="sm"
        className="mt-5"
        onClick={onRetry}
      >
        Try again
      </Button>
    </div>
  );
}

export function SuccessNotice({
  updated,
  audience,
  contact,
  next,
}: {
  updated: boolean;
  audience: LeadAudience;
  /** What was actually recorded, read back so a typo can still be caught. */
  contact: { email?: string; whatsapp?: string };
  /**
   * The API's own next-step sentence, from `POST /v1/operator-applications` —
   * yuvoy-web#150. Rendered verbatim and never rewritten here. Optional: a
   * successful application does not have to carry one.
   */
  next?: string;
}) {
  const provider = audience === "provider";
  const channels = [
    contact.email,
    contact.whatsapp ? formatForDisplay(contact.whatsapp) : undefined,
  ].filter(Boolean) as string[];

  return (
    <div role="status" className="border-paper/20 rounded-edge border p-8">
      <p className="eyebrow text-terra-soft">
        {updated
          ? "Details updated"
          : provider
            ? "Application received"
            : "You’re on the list"}
      </p>
      {/*
        The traveller heading is owner-approved canon (#27) and is quoted
        verbatim. The line under it promises a message later, never an email
        now: there is no visitor-facing autoresponder, so "check your inbox"
        would be a lie.
      */}
      <p className="font-display tracking-display mt-6 text-2xl font-normal text-balance">
        {updated
          ? "We already had you; your details are updated."
          : provider
            ? "Application received"
            : "You’re on the Yuvoy waitlist"}
      </p>
      {provider ? (
        /*
          THE API'S SENTENCE, VERBATIM — yuvoy-web#150.

          This said "The Yuvoy team will review it and contact you directly".
          Nothing kept that promise: the two operators who used this form in
          August 2026 were still waiting a month later, and D-031 P10 retires
          the review queue as work, so nothing was going to start keeping it.
          The API replaced the promise with the thing an applicant can do
          without waiting for anybody — sign themselves up at
          operators.yuvoy.in — and this screen was parsing that answer and
          dropping it on the floor.

          Rendered rather than copied into this repository ON PURPOSE. The
          whole value of `next` is that the sentence changes on the API's side
          when what is true changes, with no marketing-site deploy. It has
          changed once already for exactly that reason.

          Prose, not markup: the API returns a sentence and linkifying prose
          from an API is a guess about where the words are. If a real link is
          wanted, the API returns a structured field and this renders that.
        */
        <p className="text-paper/70 mt-4 leading-relaxed">
          {next ?? (
            /*
              The fallback, for a success that carried no `next`. It promises
              no call either — that is the whole point of the change — and it
              names the same door the API's sentence names.

              hosts.yuvoy.in since D-049 (yuvoy-mobile#397). The API's own
              sentence above may still say operators.yuvoy.in until its side
              of the rename ships, and it is shown as sent: both addresses
              serve the same portal, and rewriting the API's words here is
              exactly what this block exists not to do.
            */
            <>
              We have your application. You do not have to wait for us: you can
              set your business up at hosts.yuvoy.in with this number now.
            </>
          )}
        </p>
      ) : (
        /*
          yuvoy-web#170. This promised "we will get in touch when experiences
          for your destination are ready", which stopped being a thing to wait
          for once Havelock opened. Like the operator's line above, it now
          names what a traveller can do without waiting for anybody.
        */
        <p className="text-paper/70 mt-4 leading-relaxed">
          You do not have to wait: Yuvoy is open in Havelock now, and what hosts
          are running is {/* An <a>: this leaves the origin (yuvoy-web#154). */}
          <a
            href={appHref("waitlist")}
            className="text-paper underline underline-offset-4"
          >
            in the Yuvoy app
          </a>
          . No spam from us.
        </p>
      )}

      {/*
        The read-back, and the only thing here that catches a mistake no
        validator can: an address or a number that is perfectly well-formed
        and simply is not theirs. A person proofreads their own contact
        details when they are shown; nobody proofreads what they typed.

        The number is grouped (`+91 90000 00000`) for exactly that reason —
        an unbroken run of digits is not checkable at a glance.

        There is no inline "change it" control on purpose: the submission has
        already been recorded, so a correction is a second submission, and the
        API treats a repeat of the same contact as an update. Reloading the
        form is the honest way to do that, and the reload link says so.
      */}
      {channels.length > 0 && (
        <div className="border-paper/20 mt-6 border-t pt-6">
          <p className="text-paper/70 text-sm leading-relaxed">
            We will use{" "}
            {channels.map((channel, i) => (
              <React.Fragment key={channel}>
                {i > 0 && " and "}
                <strong className="text-paper font-bold">{channel}</strong>
              </React.Fragment>
            ))}
            .
          </p>
          {/* A button, not a link: reading `window.location` during render
              would differ between the server pass and the client one, which
              is a hydration mismatch waiting for the day this notice renders
              anywhere other than after a click. */}
          <p className="text-paper/70 mt-2 text-sm leading-relaxed">
            Not right?{" "}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="text-paper focus-visible:ring-terra-soft rounded-edge underline underline-offset-2 focus-visible:ring-2 focus-visible:outline-none"
            >
              Send it again
            </button>{" "}
            with the correct details and we will update your entry.
          </p>
        </div>
      )}
    </div>
  );
}

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="text-terra-soft text-sm">
      {message}
    </p>
  );
}

export function ConsentFields({
  privacyError,
  registerPrivacy,
  registerMarketing,
}: {
  privacyError?: string;
  registerPrivacy: object;
  registerMarketing: object;
}) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="sr-only">Consent</legend>
      <label className="text-paper/70 flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          {...registerPrivacy}
          aria-invalid={!!privacyError}
          className="accent-terra-deep mt-0.5 size-4 shrink-0"
        />
        <span>
          I agree to the{" "}
          <a
            href="/privacy"
            className="text-paper underline underline-offset-2"
          >
            Privacy Policy
          </a>{" "}
          and{" "}
          <a href="/terms" className="text-paper underline underline-offset-2">
            Terms
          </a>
          , and to Yuvoy contacting me about my registration.
        </span>
      </label>
      <FieldError id="privacy-error" message={privacyError} />
      <label className="text-paper/70 flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          {...registerMarketing}
          className="accent-terra-deep mt-0.5 size-4 shrink-0"
        />
        <span>
          Also send me occasional updates about Yuvoy. Optional: you can join
          the waitlist without this.
        </span>
      </label>
    </fieldset>
  );
}

/* ----------------------------------------------------------------- contact */

/**
 * The pair of ways to reach someone, as one group.
 *
 * Shared by both forms so the phone picker, the typo suggestion and the "one
 * is enough" wording cannot drift between them. The two differ only in whether
 * the number is required, which is the `phoneRequired` prop.
 *
 * ## Email is required, WhatsApp is not
 *
 * On both forms (owner direction, 2026-08-07). Email is what the launch
 * announcement will actually be sent on: free, no messaging-platform template
 * approval, and it reaches every country. WhatsApp is the channel for the
 * conversation afterwards, which is worth having and never worth turning
 * somebody away for withholding.
 *
 * ## The suggestion, not a correction
 *
 * A near-certain typo (`gmial.com`) offers a one-tap fix and never blocks
 * submission. It is a `<button>` rather than an auto-correct because silently
 * rewriting what someone typed into their own contact details is worse than
 * the typo: they would never know it happened.
 */
export function ContactFields({
  audience,
  control,
  register,
  setValue,
  errors,
}: {
  audience: LeadAudience;
  control: Control<TravellerValues> | Control<ProviderValues>;
  register: object;
  setValue: (value: string) => void;
  errors: { whatsapp?: string; email?: string };
}) {
  const prefix = audience === "traveller" ? "t" : "p";
  /*
    `useWatch`, not the form's `watch()`. Both read the same value; only this
    one subscribes to a single field rather than handing back a function whose
    identity changes every render. The difference is not style: React
    Compiler refuses to memoize any component that calls `watch()`, so the
    form and everything under it would re-render on every keystroke of every
    field, for a suggestion that depends on one of them.
  */
  const emailValue =
    useWatch({
      control: control as Control<TravellerValues>,
      name: "email",
    }) ?? "";
  const suggestion = suggestEmail(emailValue);

  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="label text-paper/70">How can we reach you?</legend>
      {/*
        Two audiences, two bars, and the copy says which one it is.

        A traveller joins a mailing list: an email is genuinely all we need. An
        operator files an application somebody rings — `POST
        /operator-applications` requires a number, because "the three fields
        needed to have a conversation" are the business, a person and a number
        that can be dialled. Saying "optional" there would be a lie the form
        only reveals after the submit.
      */}
      <p id={`${prefix}-contact-hint`} className="text-paper/70 mb-1 text-sm">
        {audience === "provider"
          ? "Both, please. We email you the details and call to talk it through. An application we cannot ring is one we cannot start."
          : "An email address is all we need. Add a WhatsApp number if you would rather we message you there."}
      </p>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${prefix}-email`} className="label text-paper/70">
          Email
        </label>
        <Input
          tone="onDark"
          id={`${prefix}-email`}
          {...register}
          type="email"
          inputMode="email"
          autoComplete="email"
          aria-invalid={!!errors.email}
          aria-describedby={
            errors.email
              ? `${prefix}-email-error ${prefix}-contact-hint`
              : `${prefix}-contact-hint`
          }
        />
        <FieldError id={`${prefix}-email-error`} message={errors.email} />
        {suggestion && !errors.email && (
          /*
            Not `role="alert"`: this is an offer, not a problem, and
            interrupting a screen reader mid-field to suggest a spelling is
            worse than letting them reach it in reading order. `aria-live` is
            deliberately absent for the same reason.
          */
          <p className="text-paper/70 text-sm">
            Did you mean{" "}
            <button
              type="button"
              onClick={() => setValue(suggestion)}
              className="text-paper focus-visible:ring-terra-soft rounded-edge underline underline-offset-2 focus-visible:ring-2 focus-visible:outline-none"
            >
              {suggestion}
            </button>
            ?
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-1.5">
        <label htmlFor={`${prefix}-whatsapp`} className="label text-paper/70">
          WhatsApp number{" "}
          {audience === "provider" ? null : (
            <span className="normal-case">(optional)</span>
          )}
        </label>
        {/*
          `Controller`, not `register`: the field is a composite (country plus
          national number) whose value is computed from both halves, so it has
          no single DOM node for RHF to attach to. The value it reports is
          always E.164 — see PhoneField.
        */}
        <Controller
          control={control as Control<TravellerValues>}
          name="whatsapp"
          render={({ field }) => (
            <PhoneField
              id={`${prefix}-whatsapp`}
              value={field.value ?? ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              tone="onDark"
              invalid={!!errors.whatsapp}
              describedBy={
                errors.whatsapp
                  ? `${prefix}-whatsapp-error ${prefix}-contact-hint`
                  : `${prefix}-contact-hint`
              }
            />
          )}
        />
        <FieldError id={`${prefix}-whatsapp-error`} message={errors.whatsapp} />
      </div>
    </fieldset>
  );
}

/** Visually hidden honeypot. Real visitors never see or fill it. */
export function Honeypot({ register }: { register: object }) {
  return (
    <div
      aria-hidden
      className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
    >
      <label>
        Leave this field empty
        <input type="text" tabIndex={-1} autoComplete="off" {...register} />
      </label>
    </div>
  );
}
