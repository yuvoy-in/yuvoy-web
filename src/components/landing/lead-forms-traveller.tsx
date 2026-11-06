"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitLead, type SubmitResult } from "@/lib/leads/api";
import { useLeadAnalytics } from "@/lib/analytics/use-lead-analytics";
import { LAUNCH_MARKET } from "@/lib/leads/registry";
import type { LeadContext } from "./lead-forms";
import { travellerSchema, type TravellerValues } from "./lead-forms-schema";
import {
  OutcomeNotice,
  SuccessNotice,
  FieldError,
  ConsentFields,
  ContactFields,
  Honeypot,
} from "./lead-forms-fields";

/* -------------------------------------------------------------- traveller */

/**
 * The traveller waitlist: a name, one way to reach them, and consent.
 *
 * **Nothing else** (owner direction, 2026-08-07). It asked for a destination
 * and up to three interests until then. Both were optional in the contract and
 * optional on the form, and both were dropped for the same reason: a
 * pre-launch waitlist that asks four questions converts worse than one that
 * asks two, and neither answer changes anything we do — the destination and
 * what somebody wants to do come up in the conversation that follows, on the
 * channel they just gave us.
 *
 * `context.destinationKey` still rides along as **attribution**, and only when
 * it is real. A campaign route can carry a destination in the URL; the plain
 * homepage cannot, and sending its default would file every organic signup
 * under Havelock — a number that would then be read as demand.
 */
export function TravellerForm({ context }: { context: LeadContext }) {
  const [result, setResult] = React.useState<SubmitResult | null>(null);
  const [submitted, setSubmitted] = React.useState<{
    email?: string;
    whatsapp?: string;
  }>({});
  const track = useLeadAnalytics("traveller", context.source);

  const {
    register,
    control,
    setValue,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<TravellerValues>({
    resolver: zodResolver(travellerSchema),
    defaultValues: { whatsapp: "", email: "", marketingOptIn: false },
  });

  // Attribution, never a default. `source === "web"` is organic traffic, which
  // has no destination to attribute to.
  const attributedDestination =
    context.source !== "web" ? context.destinationKey || undefined : undefined;

  async function onSubmit(values: TravellerValues) {
    const res = await submitLead({
      audience: "traveller",
      contactName: values.contactName,
      // Omitted, not sent empty: an optional field's absence is an absence,
      // and an empty string is a value. Already E.164 by the time it gets
      // here — PhoneField emits nothing else — which is what lets the API
      // deduplicate on the normalised contact.
      whatsapp: values.whatsapp || undefined,
      email: values.email,
      privacyAccepted: true,
      marketingOptIn: values.marketingOptIn,
      marketKey: LAUNCH_MARKET.key,
      source: context.source,
      website: values.website || undefined,
      primaryDestinationKey: attributedDestination,
    });
    /*
      Server-side field rejections map back onto the form fields.

      `contact` is the API's name for the "at least one way to reach you" rule
      rather than for an input (yuvoy-in/yuvoy-api#4). This form always sends
      an email address, so if that rule ever fails it is the email that was not
      accepted — which is the field the visitor can do something about.
    */
    if (res.kind === "invalid") {
      for (const [field, message] of Object.entries(res.fields)) {
        const target = field === "contact" ? "email" : field;
        if (target in values) {
          setError(target as keyof TravellerValues, { message });
        }
      }
    }
    if (res.kind === "recorded" || res.kind === "updated") {
      // Held for the success state, which reads the contact back. Kept in
      // component state rather than read from the form, because a successful
      // submit unmounts the fields.
      setSubmitted({ email: values.email, whatsapp: values.whatsapp });
      track.submitted({
        marketKey: LAUNCH_MARKET.key,
        destinationKeys: attributedDestination ? [attributedDestination] : [],
        interests: [],
      });
    } else {
      track.submissionFailed(res);
    }
    setResult(res);
  }

  if (result?.kind === "recorded" || result?.kind === "updated") {
    return (
      <SuccessNotice
        updated={result.kind === "updated"}
        audience="traveller"
        contact={submitted}
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
        <label htmlFor="t-name" className="label text-paper/70">
          Name
        </label>
        <Input
          tone="onDark"
          id="t-name"
          {...register("contactName")}
          autoComplete="name"
          aria-invalid={!!errors.contactName}
          aria-describedby={errors.contactName ? "t-name-error" : undefined}
        />
        <FieldError id="t-name-error" message={errors.contactName?.message} />
      </div>

      <ContactFields
        audience="traveller"
        control={control}
        register={register("email")}
        setValue={(value) => setValue("email", value, { shouldValidate: true })}
        errors={{
          whatsapp: errors.whatsapp?.message,
          email: errors.email?.message,
        }}
      />

      <ConsentFields
        privacyError={errors.privacyAccepted?.message}
        registerPrivacy={register("privacyAccepted")}
        registerMarketing={register("marketingOptIn")}
      />

      <Button type="submit" variant="paper" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Sending…" : "Join the waitlist"}
      </Button>
    </form>
  );
}
