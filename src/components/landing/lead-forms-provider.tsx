"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  submitOperatorApplication,
  type ApplicationResult,
} from "@/lib/operators/api";
import { useLeadAnalytics } from "@/lib/analytics/use-lead-analytics";
import { LAUNCH_MARKET } from "@/lib/leads/registry";
import type { LeadContext } from "./lead-forms";
import { providerSchema, type ProviderValues } from "./lead-forms-schema";
import {
  OutcomeNotice,
  SuccessNotice,
  FieldError,
  ConsentFields,
  ContactFields,
  Honeypot,
} from "./lead-forms-fields";

/* --------------------------------------------------------------- provider */

/*
  `recordedAcceptance()` was here and is gone — yuvoy-web#157.

  It fabricated a `LeadAcceptance` for the case where the application landed
  and the lead did not, because `SubmitResult`'s success shape carried the
  lead's acceptance and there was none. That case cannot happen any more:
  one call writes both rows in one transaction, so either both exist or
  neither does, and the form reports the application's own outcome rather than
  reconciling two.
*/

export function ProviderForm({ context }: { context: LeadContext }) {
  /*
    The APPLICATION's result, not a lead's — yuvoy-web#157.

    This form made two writes and reconciled them into a `SubmitResult`, which
    is the lead endpoint's vocabulary. One call now does both transactionally,
    so the outcome it reports is the application's own and there is nothing
    left to reconcile.
  */
  const [result, setResult] = React.useState<ApplicationResult | null>(null);
  const [submitted, setSubmitted] = React.useState<{
    email?: string;
    whatsapp?: string;
  }>({});
  /*
    What the API told us to tell them — yuvoy-web#150.

    `next` was parsed off the application response and thrown away, so the
    screen kept promising a phone call the API had stopped promising. Held
    separately from `result` because the result reported here is the LEAD's,
    by design: the application decides whether the submission succeeded, and
    the lead carries the "we already had you" distinction.
  */
  const [applicationNext, setApplicationNext] = React.useState<
    string | undefined
  >(undefined);
  /** Server-side rejections naming fields this form does not render. */
  const [unknownFieldErrors, setUnknownFieldErrors] = React.useState<string[]>(
    [],
  );
  const track = useLeadAnalytics("provider", context.source);

  const {
    register,
    control,
    setValue,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProviderValues>({
    resolver: zodResolver(providerSchema),
    defaultValues: { whatsapp: "", email: "", marketingOptIn: false },
  });

  async function onSubmit(values: ProviderValues) {
    /*
      TWO writes, and only one of them is new.

      This form filed a marketing lead and nothing else, so there was no path
      from a business filling it in to an operator existing — two real
      businesses sat in `leads` from 8 and 17 August, unread, because the
      onboarding queue was never told they were there (yuvoy-web#144).

      They are not alternatives. `/leads` is the only place `privacyAccepted`
      and `marketingOptIn` are recorded, and it is the launch announcement
      list; `/operator-applications` is the row a human picks up. Dropping
      either loses something real, so both go.

      In PARALLEL, and the application is the one whose outcome is reported.
      Sequentially, a slow lead write would delay the thing that matters; and
      if only one can land, the applicant needs to know about the one that
      decides whether anybody calls them. A lead that fails behind a successful
      application is exactly the state this form was already in for a month —
      no worse, and no longer silent about the half that counts.
    */
    const res = await submitOperatorApplication({
      businessName: values.businessName,
      contactName: values.contactName,
      // Already E.164 — PhoneField emits nothing else.
      phone: values.whatsapp,
      email: values.email,
      market: LAUNCH_MARKET.key,
      source: context.source,
      /*
        The consent, and the switch that makes this one transaction.

        `true` is the only value this form can ever send. `privacyAccepted` is
        a TRI-STATE — omitted behaves as the endpoint always did, `true` writes
        both rows linked, and `false` is refused with `400`, because recording
        a marketing contact for somebody who declined is the one outcome it
        must not produce. This form cannot be submitted without the box ticked,
        so `false` is unreachable and is deliberately not sent as a default.
      */
      privacyAccepted: true,
      marketingOptIn: values.marketingOptIn,
    });
    if (res.kind === "invalid") {
      /*
        Server field errors are mapped back onto the form — but **only the
        fields this form actually has**.

        Handing an unknown field to `setError` puts the message on an input
        that never renders, and the applicant sees the button do nothing at
        all: the worst failure a form has, because it looks like a bug in
        their browser.

        **`contact` is the one that matters now** (yuvoy-in/yuvoy-api#4). The
        API reports "no way to reach you" on that name rather than on
        `whatsapp`, precisely because a form may no longer render a WhatsApp
        input to point at — so it names the rule, not a field. The rule is
        about the email address here, since that is the channel this form
        requires, so the message goes there where it can be acted on.

        Anything else unrecognised is raised to the form's own error state,
        where it is visible and truthful rather than swallowed. That guard
        earned its keep once already, in the window before #4 deployed.
      */
      const unknown: string[] = [];
      for (const [field, message] of Object.entries(res.fields)) {
        if (field in values) {
          setError(field as keyof ProviderValues, { message });
        } else if (field === "contact") {
          setError("email", { message });
        } else {
          unknown.push(message);
        }
      }
      setUnknownFieldErrors(unknown);
    } else {
      setUnknownFieldErrors([]);
    }
    if (res.kind === "received") {
      setSubmitted({ email: values.email, whatsapp: values.whatsapp });
      // Optional on the response, and absent is a normal answer rather than a
      // failure — `SuccessNotice` has its own sentence for that case.
      setApplicationNext(res.next);
      track.submitted({
        marketKey: LAUNCH_MARKET.key,
        destinationKeys: [],
        interests: [],
      });
    } else {
      /*
        The three failure kinds are shaped identically in `ApplicationResult`
        and `SubmitResult` — `rate_limited`, `unavailable`, `offline` — and
        `invalid` carries the same two fields. Narrowed rather than cast, so
        that a future divergence between the two unions is a build failure
        here instead of a silently unreported submission.
      */
      track.submissionFailed(res);
    }
    setResult(res);
  }

  if (result?.kind === "received") {
    return (
      <SuccessNotice
        /*
          Always false for an operator now — yuvoy-web#157.

          "We already had you; your details are updated" was the LEAD's
          distinction, and there is no lead call any more. The application
          endpoint answers `202` either way and returns no identifier at all,
          deliberately: "there is nothing a stranger could do with one."

          So a repeat applicant reads "Application received" both times, which
          is true both times. Less informative than it was; not less honest,
          and the alternative was inventing a distinction the response does not
          make.
        */
        updated={false}
        audience="provider"
        contact={submitted}
        next={applicationNext}
      />
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit, (fieldErrors) =>
        track.validationFailed(Object.keys(fieldErrors)),
      )}
      onFocus={track.formStarted}
      noValidate
      className="relative flex flex-col gap-5"
    >
      <Honeypot register={register("website")} />

      {(result?.kind === "rate_limited" ||
        result?.kind === "unavailable" ||
        result?.kind === "offline") && (
        <OutcomeNotice result={result} onRetry={() => setResult(null)} />
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="p-name" className="label text-paper/70">
          Your name
        </label>
        <Input
          tone="onDark"
          id="p-name"
          {...register("contactName")}
          autoComplete="name"
          aria-invalid={!!errors.contactName}
        />
        <FieldError id="p-name-error" message={errors.contactName?.message} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="p-business" className="label text-paper/70">
          Business name
        </label>
        <Input
          tone="onDark"
          id="p-business"
          {...register("businessName")}
          autoComplete="organization"
          aria-invalid={!!errors.businessName}
        />
        <FieldError
          id="p-business-error"
          message={errors.businessName?.message}
        />
      </div>

      <ContactFields
        audience="provider"
        control={control}
        register={register("email")}
        setValue={(value) => setValue("email", value, { shouldValidate: true })}
        errors={{
          whatsapp: errors.whatsapp?.message,
          email: errors.email?.message,
        }}
      />

      {/*
        Server-side rejections that name a field this form does not render and
        that is not the `contact` rule handled above. Shown plainly rather than
        swallowed by a `setError` call on an input that is not on screen — the
        failure mode this caught in the window before yuvoy-in/yuvoy-api#4
        deployed, when every valid application was rejected on three fields the
        form no longer had.
      */}
      {unknownFieldErrors.length > 0 && (
        <div
          role="alert"
          className="border-terra-soft/40 rounded-edge border p-6"
        >
          <p className="font-display tracking-display text-xl font-normal">
            We couldn&rsquo;t save that.
          </p>
          <ul className="text-paper/70 mt-2 flex flex-col gap-1 text-sm">
            {unknownFieldErrors.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
          <p className="text-paper/70 mt-3 text-sm">
            Nothing was recorded. Please try again shortly.
          </p>
        </div>
      )}

      <ConsentFields
        privacyError={errors.privacyAccepted?.message}
        registerPrivacy={register("privacyAccepted")}
        registerMarketing={register("marketingOptIn")}
      />

      {/* The host button says what the host is doing. It read "Join
          the waitlist" until 2026-08-06, which is the traveller's action and
          the wrong promise: a host is applying, and the difference
          between an application and a signup is the whole framing of the
          page this form sits on. */}
      <Button type="submit" variant="paper" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Sending…" : "Apply as a founding host"}
      </Button>

      <p className="text-paper/70 text-xs">
        Pricing, capacity and listings come later, in conversation. This just
        opens the door.
      </p>
    </form>
  );
}
