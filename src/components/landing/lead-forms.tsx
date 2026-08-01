"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import { submitLead, type SubmitResult } from "@/lib/leads/api";
import {
  DEFAULT_DESTINATION,
  INTERESTS,
  LAUNCH_MARKET,
  type InterestGroup,
  type LeadAudience,
  type LeadSource,
} from "@/lib/leads/registry";

/** Attribution carried from a /go/<source> campaign route. */
export interface LeadContext {
  source: LeadSource;
  destinationKey: string;
}

/* ------------------------------------------------------------------ schema */

const phoneSchema = z
  .string()
  .trim()
  .min(1, "Enter your WhatsApp number.")
  .regex(
    /^\+[0-9()\-. ]{8,20}$/,
    "Include your country code, for example +91.",
  );

const sharedSchema = {
  contactName: z
    .string()
    .trim()
    .min(1, "Enter your name.")
    .max(120, "Name must be 120 characters or fewer."),
  whatsapp: phoneSchema,
  email: z
    .string()
    .trim()
    .max(254)
    .email("Enter a valid email address.")
    .optional()
    .or(z.literal("")),
  privacyAccepted: z.literal(true, {
    message: "Please accept the Privacy Policy and Terms to continue.",
  }),
  marketingOptIn: z.boolean(),
  website: z.string().max(255).optional(), // honeypot
};

const travellerSchema = z.object({
  ...sharedSchema,
  primaryDestinationKey: z
    .string()
    .refine((v) => LAUNCH_MARKET.destinations.some((d) => d.key === v), {
      message: "Choose where you're headed.",
    }),
  interests: z
    .array(z.string())
    .min(1, "Choose at least one interest.")
    .max(3, "Choose up to three interests."),
});

const providerSchema = z.object({
  ...sharedSchema,
  businessName: z
    .string()
    .trim()
    .min(1, "Enter your business name.")
    .max(160, "Business name must be 160 characters or fewer."),
  coverageDestinationKeys: z
    .array(z.string())
    .min(1, "Choose at least one destination you cover."),
  primaryInterest: z
    .string()
    .refine((v) => INTERESTS.some((i) => i.key === v), {
      message: "Choose what you mainly offer.",
    }),
});

type TravellerValues = z.infer<typeof travellerSchema>;
type ProviderValues = z.infer<typeof providerSchema>;

/* ------------------------------------------------------------------- shell */

/**
 * Dual-audience registration. One section, two tabs, both forms posting to
 * POST /v1/leads with the audience discriminator. Every outcome the API can
 * produce — recorded, updated, invalid, rate-limited, unavailable, offline —
 * has its own truthful UI state.
 */
export function LeadForms({ context }: { context: LeadContext }) {
  const [audience, setAudience] = React.useState<LeadAudience>("traveller");

  // #providers deep-links straight onto the provider tab — from the hero CTA,
  // the footer, and any external link. Hash navigation alone can't switch a
  // React tab, so listen for it.
  React.useEffect(() => {
    function syncFromHash() {
      if (window.location.hash === "#providers") setAudience("provider");
    }
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  return (
    <section
      id="register"
      className="scroll-mt-10 px-6 py-20 sm:px-10"
      aria-labelledby="register-heading"
    >
      {/* Always-present anchor: the target must exist even while the provider
          panel is hidden, or the browser has nothing to scroll to. */}
      <span id="providers" className="block scroll-mt-24" aria-hidden />
      <div className="mx-auto max-w-xl">
        <div className="text-center">
          <p className="label text-terra-deep">Register interest</p>
          <h2
            id="register-heading"
            className="font-display text-teal mt-3 text-3xl sm:text-4xl"
          >
            Be there when it opens.
          </h2>
          <p className="text-teal/70 mt-4">
            Tell us who you are and we&rsquo;ll be in touch as the season takes
            shape. No queue positions, no spam — a person will read this.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="I am a"
          className="border-cream-line bg-cream-deep/50 mt-10 flex rounded-full border p-1"
        >
          {(
            [
              ["traveller", "I'm travelling"],
              ["provider", "I run experiences"],
            ] as const
          ).map(([value, tabLabel]) => (
            <button
              key={value}
              role="tab"
              id={`tab-${value}`}
              aria-selected={audience === value}
              aria-controls={`panel-${value}`}
              onClick={() => setAudience(value)}
              className={cn(
                "focus-visible:ring-terra-deep flex-1 rounded-full px-4 py-2.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none",
                audience === value
                  ? "bg-teal text-cream"
                  : "text-teal/75 hover:text-teal",
              )}
            >
              {tabLabel}
            </button>
          ))}
        </div>

        <div
          role="tabpanel"
          id="panel-traveller"
          aria-labelledby="tab-traveller"
          hidden={audience !== "traveller"}
          className="mt-8"
        >
          <TravellerForm context={context} />
        </div>
        <div
          role="tabpanel"
          id="panel-provider"
          aria-labelledby="tab-provider"
          hidden={audience !== "provider"}
          className="mt-8"
        >
          <ProviderForm context={context} />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- outcome UI */

function OutcomeNotice({
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
      body: "Give it a minute and try again — your details weren't saved yet.",
    },
    unavailable: {
      title: "We couldn't save that.",
      body: "Something on our side isn't answering. Nothing was recorded — please try again shortly.",
    },
    offline: {
      title: "You look offline.",
      body: "Check your connection and try again — nothing was sent.",
    },
  }[result.kind];

  return (
    <div
      role="alert"
      className="border-terra-deep/30 bg-terra/5 rounded-3xl border p-6 text-center"
    >
      <p className="font-display text-teal text-xl">{copy.title}</p>
      <p className="text-teal/70 mt-2 text-sm">{copy.body}</p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-4"
        onClick={onRetry}
      >
        Try again
      </Button>
    </div>
  );
}

function SuccessNotice({
  updated,
  audience,
}: {
  updated: boolean;
  audience: LeadAudience;
}) {
  return (
    <div
      role="status"
      className="border-cream-line bg-cream-deep/50 rounded-3xl border p-8 text-center"
    >
      <p className="label text-terra-deep">
        {updated ? "Details updated" : "You're registered"}
      </p>
      <p className="font-display text-teal mt-4 text-2xl">
        {updated
          ? "We already had you — your preferences are updated."
          : "Thank you. A person will read this."}
      </p>
      <p className="text-teal/70 mt-3 text-sm">
        {audience === "provider"
          ? "Someone from Yuvoy will reach out on WhatsApp to talk through what you offer."
          : "We'll be in touch as the season takes shape. Until then — don't be a tourist."}
      </p>
    </div>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="text-terra-deep px-5 text-sm">
      {message}
    </p>
  );
}

function ConsentFields({
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
      <label className="text-teal/70 flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          {...registerPrivacy}
          aria-invalid={!!privacyError}
          className="accent-teal mt-0.5 size-4 shrink-0"
        />
        <span>
          I agree to the{" "}
          <a href="/privacy" className="text-teal underline underline-offset-2">
            Privacy Policy
          </a>{" "}
          and{" "}
          <a href="/terms" className="text-teal underline underline-offset-2">
            Terms
          </a>
          , and to Yuvoy contacting me about my registration.
        </span>
      </label>
      <FieldError id="privacy-error" message={privacyError} />
      <label className="text-teal/70 flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          {...registerMarketing}
          className="accent-teal mt-0.5 size-4 shrink-0"
        />
        <span>
          Also send me occasional updates about Yuvoy. Optional — you can
          register without this.
        </span>
      </label>
    </fieldset>
  );
}

/** Visually hidden honeypot. Real visitors never see or fill it. */
function Honeypot({ register }: { register: object }) {
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

/* -------------------------------------------------------------- traveller */

function TravellerForm({ context }: { context: LeadContext }) {
  const [result, setResult] = React.useState<SubmitResult | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<TravellerValues>({
    resolver: zodResolver(travellerSchema),
    defaultValues: {
      primaryDestinationKey: context.destinationKey || DEFAULT_DESTINATION.key,
      interests: [],
      marketingOptIn: false,
    },
  });

  async function onSubmit(values: TravellerValues) {
    const res = await submitLead({
      audience: "traveller",
      contactName: values.contactName,
      whatsapp: values.whatsapp.replace(/[^\d+]/g, ""),
      email: values.email || undefined,
      privacyAccepted: true,
      marketingOptIn: values.marketingOptIn,
      marketKey: LAUNCH_MARKET.key,
      source: context.source,
      website: values.website || undefined,
      primaryDestinationKey: values.primaryDestinationKey,
      interests: values.interests as InterestGroup[],
    });
    // Server-side field rejections map back onto the form fields.
    if (res.kind === "invalid") {
      for (const [field, message] of Object.entries(res.fields)) {
        setError(field as keyof TravellerValues, { message });
      }
    }
    setResult(res);
  }

  if (result?.kind === "recorded" || result?.kind === "updated") {
    return (
      <SuccessNotice updated={result.kind === "updated"} audience="traveller" />
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
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
        <label htmlFor="t-name" className="label text-teal/75 px-5">
          Name
        </label>
        <Input
          id="t-name"
          {...register("contactName")}
          autoComplete="name"
          aria-invalid={!!errors.contactName}
          aria-describedby={errors.contactName ? "t-name-error" : undefined}
        />
        <FieldError id="t-name-error" message={errors.contactName?.message} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="t-whatsapp" className="label text-teal/75 px-5">
          WhatsApp number
        </label>
        <Input
          id="t-whatsapp"
          {...register("whatsapp")}
          type="tel"
          inputMode="tel"
          placeholder="+91"
          autoComplete="tel"
          aria-invalid={!!errors.whatsapp}
          aria-describedby={errors.whatsapp ? "t-whatsapp-error" : undefined}
        />
        <FieldError id="t-whatsapp-error" message={errors.whatsapp?.message} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="t-email" className="label text-teal/75 px-5">
          Email <span className="normal-case">(optional)</span>
        </label>
        <Input
          id="t-email"
          {...register("email")}
          type="email"
          inputMode="email"
          autoComplete="email"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "t-email-error" : undefined}
        />
        <FieldError id="t-email-error" message={errors.email?.message} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="t-destination" className="label text-teal/75 px-5">
          Where are you headed first?
        </label>
        <select
          id="t-destination"
          {...register("primaryDestinationKey")}
          className="border-teal/20 bg-cream-deep text-teal focus-visible:border-terra-deep focus-visible:ring-terra-deep/30 h-11 w-full rounded-full border px-5 text-sm focus-visible:ring-2 focus-visible:outline-none"
          aria-invalid={!!errors.primaryDestinationKey}
        >
          {LAUNCH_MARKET.destinations.map((d) => (
            <option key={d.key} value={d.key}>
              {d.label}
            </option>
          ))}
        </select>
        <FieldError
          id="t-destination-error"
          message={errors.primaryDestinationKey?.message}
        />
      </div>

      <fieldset>
        <legend className="label text-teal/75 px-5">
          What draws you? <span className="normal-case">(up to three)</span>
        </legend>
        <div className="mt-2 flex flex-wrap gap-2 px-1">
          {INTERESTS.map((interest) => (
            <label
              key={interest.key}
              className="border-cream-line bg-cream-deep/60 text-teal/80 has-checked:bg-teal has-checked:text-cream cursor-pointer rounded-full border px-4 py-2 text-sm transition-colors"
            >
              <input
                type="checkbox"
                value={interest.key}
                {...register("interests")}
                className="sr-only"
              />
              {interest.label}
            </label>
          ))}
        </div>
        <FieldError
          id="t-interests-error"
          message={errors.interests?.message}
        />
      </fieldset>

      <ConsentFields
        privacyError={errors.privacyAccepted?.message}
        registerPrivacy={register("privacyAccepted")}
        registerMarketing={register("marketingOptIn")}
      />

      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Sending…" : "Register interest"}
      </Button>
    </form>
  );
}

/* --------------------------------------------------------------- provider */

function ProviderForm({ context }: { context: LeadContext }) {
  const [result, setResult] = React.useState<SubmitResult | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProviderValues>({
    resolver: zodResolver(providerSchema),
    defaultValues: { coverageDestinationKeys: [], marketingOptIn: false },
  });

  async function onSubmit(values: ProviderValues) {
    const res = await submitLead({
      audience: "provider",
      contactName: values.contactName,
      whatsapp: values.whatsapp.replace(/[^\d+]/g, ""),
      email: values.email || undefined,
      privacyAccepted: true,
      marketingOptIn: values.marketingOptIn,
      marketKey: LAUNCH_MARKET.key,
      source: context.source,
      website: values.website || undefined,
      businessName: values.businessName,
      coverageDestinationKeys: values.coverageDestinationKeys,
      primaryInterest: values.primaryInterest as InterestGroup,
    });
    if (res.kind === "invalid") {
      for (const [field, message] of Object.entries(res.fields)) {
        setError(field as keyof ProviderValues, { message });
      }
    }
    setResult(res);
  }

  if (result?.kind === "recorded" || result?.kind === "updated") {
    return (
      <SuccessNotice updated={result.kind === "updated"} audience="provider" />
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
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
        <label htmlFor="p-name" className="label text-teal/75 px-5">
          Your name
        </label>
        <Input
          id="p-name"
          {...register("contactName")}
          autoComplete="name"
          aria-invalid={!!errors.contactName}
        />
        <FieldError id="p-name-error" message={errors.contactName?.message} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="p-business" className="label text-teal/75 px-5">
          Business name
        </label>
        <Input
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

      <div className="flex flex-col gap-1.5">
        <label htmlFor="p-whatsapp" className="label text-teal/75 px-5">
          WhatsApp number
        </label>
        <Input
          id="p-whatsapp"
          {...register("whatsapp")}
          type="tel"
          inputMode="tel"
          placeholder="+91"
          autoComplete="tel"
          aria-invalid={!!errors.whatsapp}
        />
        <FieldError id="p-whatsapp-error" message={errors.whatsapp?.message} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="p-email" className="label text-teal/75 px-5">
          Email <span className="normal-case">(optional)</span>
        </label>
        <Input
          id="p-email"
          {...register("email")}
          type="email"
          inputMode="email"
          autoComplete="email"
          aria-invalid={!!errors.email}
        />
        <FieldError id="p-email-error" message={errors.email?.message} />
      </div>

      <fieldset>
        <legend className="label text-teal/75 px-5">Where you operate</legend>
        <div className="mt-2 flex flex-wrap gap-2 px-1">
          {LAUNCH_MARKET.destinations.map((d) => (
            <label
              key={d.key}
              className="border-cream-line bg-cream-deep/60 text-teal/80 has-checked:bg-teal has-checked:text-cream cursor-pointer rounded-full border px-4 py-2 text-sm transition-colors"
            >
              <input
                type="checkbox"
                value={d.key}
                {...register("coverageDestinationKeys")}
                className="sr-only"
              />
              {d.label}
            </label>
          ))}
        </div>
        <FieldError
          id="p-coverage-error"
          message={errors.coverageDestinationKeys?.message}
        />
      </fieldset>

      <fieldset>
        <legend className="label text-teal/75 px-5">
          What you mainly offer
        </legend>
        <div className="mt-2 flex flex-wrap gap-2 px-1">
          {INTERESTS.map((interest) => (
            <label
              key={interest.key}
              className="border-cream-line bg-cream-deep/60 text-teal/80 has-checked:bg-teal has-checked:text-cream cursor-pointer rounded-full border px-4 py-2 text-sm transition-colors"
            >
              <input
                type="radio"
                value={interest.key}
                {...register("primaryInterest")}
                className="sr-only"
              />
              {interest.label}
            </label>
          ))}
        </div>
        <FieldError
          id="p-interest-error"
          message={errors.primaryInterest?.message}
        />
      </fieldset>

      <ConsentFields
        privacyError={errors.privacyAccepted?.message}
        registerPrivacy={register("privacyAccepted")}
        registerMarketing={register("marketingOptIn")}
      />

      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Sending…" : "Register my business"}
      </Button>

      <p className="text-teal/75 text-center text-xs">
        Pricing, capacity and listings come later, in conversation — this just
        opens the door.
      </p>
    </form>
  );
}
