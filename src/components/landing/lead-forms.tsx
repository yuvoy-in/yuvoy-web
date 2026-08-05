"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import { submitLead, type SubmitResult } from "@/lib/leads/api";
import { useAnalytics } from "@/components/analytics/analytics-provider";
import { useLeadAnalytics } from "@/lib/analytics/use-lead-analytics";
import { audienceSelected } from "@/lib/analytics/events";
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
 * Registration, for one audience or both. Every form posts to POST /v1/leads
 * with the audience discriminator, and every outcome the API can produce —
 * recorded, updated, invalid, rate-limited, unavailable, offline — has its own
 * truthful UI state.
 *
 * `audiences` decides the shape. With both, this is the tabbed picker
 * `/waitlist` uses. With one, there is nothing to pick, so no tablist renders
 * and the form is not a tabpanel: the homepage speaks to travellers and
 * `/operators` speaks to operators, and neither should show the other's door.
 */
const BOTH_AUDIENCES = ["traveller", "provider"] as const;

export function LeadForms({
  context,
  initialAudience = "traveller",
  heading = "Join the waitlist",
  headingLevel = 2,
  aside,
  audiences = BOTH_AUDIENCES,
  sectionId = "register",
  eyebrow = "Get first access",
  intro,
}: {
  context: LeadContext;
  /**
   * Which tab opens first, when there are tabs.
   * `/waitlist?audience=provider` — the shape printed on operator materials —
   * resolves to "provider" here.
   */
  initialAudience?: LeadAudience;
  heading?: string;
  /** `/waitlist` renders this as the page's h1; a section on a page as an h2. */
  headingLevel?: 1 | 2;
  /**
   * Optional narrative column. When present the section renders as a split
   * layout — aside left, form right — and the aside **must** contain an
   * element with `id="${sectionId}-heading"` (see JoinAside), because it takes
   * over the heading this component otherwise renders itself.
   */
  aside?: React.ReactNode;
  /** Which audiences this instance offers. One of them hides the picker. */
  audiences?: readonly LeadAudience[];
  /** The section's anchor id; its heading is `<id>-heading`. */
  sectionId?: string;
  eyebrow?: string;
  intro?: React.ReactNode;
}) {
  const offersProvider = audiences.includes("provider");
  const single = audiences.length === 1 ? audiences[0] : null;
  const headingId = `${sectionId}-heading`;
  const [audience, setAudience] = React.useState<LeadAudience>(
    single ?? initialAudience,
  );
  const Heading = headingLevel === 1 ? "h1" : "h2";
  const { capture } = useAnalytics();

  // audience_selected has three trigger points and one shape. The query-param
  // preselect fires once on mount; the tab fires on an actual change, so a
  // page opened at ?audience=provider does not double-fire.
  const reportedPreselect = React.useRef(false);
  React.useEffect(() => {
    if (reportedPreselect.current) return;
    reportedPreselect.current = true;
    if (initialAudience !== "traveller") {
      capture(
        audienceSelected({ audience: initialAudience, trigger: "query_param" }),
      );
    }
  }, [capture, initialAudience]);

  function selectAudience(next: LeadAudience, trigger: "tab" | "cta") {
    if (next === audience) return;
    setAudience(next);
    capture(audienceSelected({ audience: next, trigger }));
  }

  // #providers deep-links straight onto the provider tab. Those anchors are
  // kept working indefinitely: /waitlist used to be a permanent (308) redirect
  // to them, and browsers cache 308s forever, so a visitor who hit the old URL
  // before the real page shipped still lands somewhere coherent.
  React.useEffect(() => {
    if (!offersProvider) return;
    function syncFromHash() {
      if (window.location.hash === "#providers")
        setAudience((current) => {
          if (current !== "provider") {
            capture(audienceSelected({ audience: "provider", trigger: "cta" }));
          }
          return "provider";
        });
    }
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, [capture, offersProvider]);

  /**
   * One audience: the form on its own. Two: the picker above them. A single
   * form is deliberately not a tabpanel — a tabpanel with no tablist is a
   * promise to assistive tech that there is somewhere else to go.
   */
  const forms = single ? (
    single === "traveller" ? (
      <TravellerForm context={context} />
    ) : (
      <ProviderForm context={context} />
    )
  ) : (
    <>
      <div
        role="tablist"
        aria-label="I am a"
        className="border-cream/20 rounded-edge flex border p-1"
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
            onClick={() => selectAudience(value, "tab")}
            className={cn(
              "focus-visible:ring-terra-soft rounded-edge flex-1 px-4 py-2.5 text-sm font-medium transition-colors duration-200 focus-visible:ring-2 focus-visible:outline-none",
              audience === value
                ? "bg-cream text-forest"
                : "text-cream/70 hover:text-cream",
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
        className="mt-10"
      >
        <TravellerForm context={context} />
      </div>
      <div
        role="tabpanel"
        id="panel-provider"
        aria-labelledby="tab-provider"
        hidden={audience !== "provider"}
        className="mt-10"
      >
        <ProviderForm context={context} />
      </div>
    </>
  );

  return (
    <section
      id={sectionId}
      className="bg-forest text-cream scroll-mt-16"
      aria-labelledby={headingId}
    >
      {/* The legacy operator anchor, wherever a provider form actually lives.
          It must exist even while the provider panel is hidden, or the browser
          has nothing to scroll to. The homepage no longer offers that form and
          redirects the anchor instead (see LegacyProviderAnchor). */}
      {offersProvider && (
        <span id="providers" className="block scroll-mt-20" aria-hidden />
      )}
      <div className="container-page py-20 sm:py-28">
        {aside ? (
          /* Split layout: narrative left (carrying the section heading), form
             right. Used by the homepage's closing act. */
          <div className="grid grid-cols-1 gap-14 lg:grid-cols-2 lg:gap-20">
            <div>{aside}</div>
            <div>{forms}</div>
          </div>
        ) : (
          <div className="mx-auto max-w-xl">
            <div>
              <p className="eyebrow text-terra-soft">{eyebrow}</p>
              <Heading
                id={headingId}
                className="font-display tracking-display mt-6 text-[clamp(2.125rem,5vw,3.375rem)] leading-[1.04] font-normal text-balance"
              >
                {heading}
              </Heading>
              <div className="text-cream/70 mt-6 text-lg leading-relaxed">
                {intro ?? (
                  <p>
                    Tell us who you are and we&rsquo;ll message you when the
                    first Andaman experiences are ready. No spam, and no payment
                    required.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-10">{forms}</div>
          </div>
        )}
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
      <p className="text-cream/70 mt-2 text-sm">{copy.body}</p>
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

function SuccessNotice({
  updated,
  audience,
}: {
  updated: boolean;
  audience: LeadAudience;
}) {
  return (
    <div role="status" className="border-cream/20 rounded-edge border p-8">
      <p className="eyebrow text-terra-soft">
        {updated ? "Details updated" : "You’re on the list"}
      </p>
      {/*
        The confirmation heading is owner-approved canon (#27) and is quoted
        verbatim. The post-submit line is too — note it promises a message
        later, never an email now: there is no visitor-facing autoresponder,
        so "check your inbox" would be a lie.
      */}
      <p className="font-display tracking-display mt-6 text-2xl font-normal text-balance">
        {updated
          ? "We already had you; your preferences are updated."
          : "You’re on the Yuvoy waitlist"}
      </p>
      <p className="text-cream/70 mt-4 leading-relaxed">
        We&rsquo;ll message you when the first Andaman experiences are ready. No
        spam, and no payment required.
      </p>
      {audience === "provider" && (
        <p className="text-cream/70 mt-3 leading-relaxed">
          Someone from Yuvoy will reach out on WhatsApp to talk through what you
          offer.
        </p>
      )}
    </div>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="text-terra-soft text-sm">
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
      <label className="text-cream/70 flex items-start gap-3 text-sm">
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
            className="text-cream underline underline-offset-2"
          >
            Privacy Policy
          </a>{" "}
          and{" "}
          <a href="/terms" className="text-cream underline underline-offset-2">
            Terms
          </a>
          , and to Yuvoy contacting me about my registration.
        </span>
      </label>
      <FieldError id="privacy-error" message={privacyError} />
      <label className="text-cream/70 flex items-start gap-3 text-sm">
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
  const track = useLeadAnalytics("traveller", context.source);

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
    if (res.kind === "recorded" || res.kind === "updated") {
      track.submitted({
        marketKey: LAUNCH_MARKET.key,
        destinationKeys: [values.primaryDestinationKey],
        interests: values.interests as InterestGroup[],
      });
    } else {
      track.submissionFailed(res);
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
        <label htmlFor="t-name" className="label text-cream/70">
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

      <div className="flex flex-col gap-1.5">
        <label htmlFor="t-whatsapp" className="label text-cream/70">
          WhatsApp number
        </label>
        <Input
          tone="onDark"
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
        <label htmlFor="t-email" className="label text-cream/70">
          Email <span className="normal-case">(optional)</span>
        </label>
        <Input
          tone="onDark"
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
        <label htmlFor="t-destination" className="label text-cream/70">
          Where are you headed first?
        </label>
        <select
          id="t-destination"
          {...register("primaryDestinationKey", {
            onChange: (event) =>
              track.destinationChanged(
                context.destinationKey,
                event.target.value,
              ),
          })}
          className="border-cream/20 bg-cream/5 text-cream focus-visible:border-terra-soft focus-visible:ring-terra-soft/40 rounded-edge h-12 w-full border px-4 text-sm transition-colors duration-200 focus-visible:ring-2 focus-visible:outline-none"
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
        <legend className="label text-cream/70">
          What draws you? <span className="normal-case">(up to three)</span>
        </legend>
        <div className="mt-2 flex flex-wrap gap-2 px-1">
          {INTERESTS.map((interest) => (
            <label
              key={interest.key}
              className="border-cream/20 text-cream/80 has-checked:bg-cream has-checked:text-forest has-checked:border-cream rounded-edge has-focus-visible:ring-terra-soft cursor-pointer border px-4 py-2 text-sm transition-colors duration-200 has-focus-visible:ring-2"
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

      <Button type="submit" variant="paper" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Sending…" : "Join the waitlist"}
      </Button>
    </form>
  );
}

/* --------------------------------------------------------------- provider */

function ProviderForm({ context }: { context: LeadContext }) {
  const [result, setResult] = React.useState<SubmitResult | null>(null);
  const track = useLeadAnalytics("provider", context.source);

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
    if (res.kind === "recorded" || res.kind === "updated") {
      track.submitted({
        marketKey: LAUNCH_MARKET.key,
        destinationKeys: values.coverageDestinationKeys,
        interests: [values.primaryInterest as InterestGroup],
      });
    } else {
      track.submissionFailed(res);
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
        <label htmlFor="p-name" className="label text-cream/70">
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
        <label htmlFor="p-business" className="label text-cream/70">
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

      <div className="flex flex-col gap-1.5">
        <label htmlFor="p-whatsapp" className="label text-cream/70">
          WhatsApp number
        </label>
        <Input
          tone="onDark"
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
        <label htmlFor="p-email" className="label text-cream/70">
          Email <span className="normal-case">(optional)</span>
        </label>
        <Input
          tone="onDark"
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
        <legend className="label text-cream/70">Where you operate</legend>
        <div className="mt-2 flex flex-wrap gap-2 px-1">
          {LAUNCH_MARKET.destinations.map((d) => (
            <label
              key={d.key}
              className="border-cream/20 text-cream/80 has-checked:bg-cream has-checked:text-forest has-checked:border-cream rounded-edge has-focus-visible:ring-terra-soft cursor-pointer border px-4 py-2 text-sm transition-colors duration-200 has-focus-visible:ring-2"
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
        <legend className="label text-cream/70">What you mainly offer</legend>
        <div className="mt-2 flex flex-wrap gap-2 px-1">
          {INTERESTS.map((interest) => (
            <label
              key={interest.key}
              className="border-cream/20 text-cream/80 has-checked:bg-cream has-checked:text-forest has-checked:border-cream rounded-edge has-focus-visible:ring-terra-soft cursor-pointer border px-4 py-2 text-sm transition-colors duration-200 has-focus-visible:ring-2"
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

      <Button type="submit" variant="paper" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Sending…" : "Join the waitlist"}
      </Button>

      <p className="text-cream/70 text-xs">
        Pricing, capacity and listings come later, in conversation. This just
        opens the door.
      </p>
    </form>
  );
}
