"use client";

import * as React from "react";
import { Controller, useForm, useWatch, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneField } from "@/components/ui/phone-field";
import { cn } from "@/lib/cn";
import { submitLead, type SubmitResult } from "@/lib/leads/api";
import { useAnalytics } from "@/components/analytics/analytics-provider";
import { useLeadAnalytics } from "@/lib/analytics/use-lead-analytics";
import { audienceSelected } from "@/lib/analytics/events";
import { formatForDisplay, phoneIssue } from "@/lib/contact/phone";
import { OPERATOR_FORM_LIVE } from "@/lib/site/launch";
import { ApplyComingSoon } from "@/components/operators/apply-coming-soon";
import { isPlausibleEmail, suggestEmail } from "@/lib/contact/email";
import {
  LAUNCH_MARKET,
  type LeadAudience,
  type LeadSource,
} from "@/lib/leads/registry";

/** Attribution carried from a /go/<source> campaign route. */
export interface LeadContext {
  source: LeadSource;
  destinationKey: string;
}

/* ------------------------------------------------------------------ schema */

/**
 * Phone validation lives in `@/lib/contact/phone`, not in a regex here.
 *
 * `PhoneField` submits E.164 and nothing else, so what reaches this schema is
 * already canonical (`+919000000000`) and the only remaining question is
 * whether it is *possible* — the right number of digits for the country code
 * it carries. `phoneIssue` answers that from the curated table and returns a
 * message naming the country, which is the difference between "that looks too
 * short for India" and an unactionable "invalid phone number".
 *
 * The old rule here was `/^\+[0-9()\-. ]{8,20}$/`: it accepted `+1` followed
 * by seven of anything, could not tell a dropped digit from a complete number,
 * and its message named India, which quietly told every other country they
 * were in the wrong place.
 */
const phoneIssueCheck = (value: string, ctx: z.RefinementCtx) => {
  const issue = phoneIssue(value);
  if (issue) ctx.addIssue({ code: "custom", message: issue });
};

/**
 * Optional on both forms, but still validated when supplied. An empty string
 * is the browser's value for an untouched field and must pass; a half-typed
 * number must not.
 */
const optionalPhoneSchema = z
  .string()
  .trim()
  .superRefine((value, ctx) => {
    if (!value) return;
    phoneIssueCheck(value, ctx);
  });

/**
 * **Email is the one contact detail we ask everybody for** (owner direction,
 * 2026-08-07), on both forms. It is what the launch announcement will actually
 * be sent on: free, no messaging-platform template approval, and it reaches
 * every country. A WhatsApp number is the channel for the conversation
 * afterwards, which is why it is offered and never required.
 *
 * The rule is deliberately looser than Zod's own `.email()`. `isPlausibleEmail`
 * rejects only what cannot be delivered under any reading: no `@`, nothing
 * either side of it, a domain with no dot, whitespace. Every rule beyond that
 * is another way to refuse somebody's real address, and a person told their own
 * email is invalid does not file a bug report. Typos are handled where they
 * belong — as a *suggestion* next to the field, which the visitor can take or
 * ignore.
 */
const requiredEmailSchema = z
  .string()
  .trim()
  .min(1, "Enter your email address.")
  .max(254, "That email address is too long.")
  .refine(isPlausibleEmail, "Enter a valid email address.");

const sharedSchema = {
  contactName: z
    .string()
    .trim()
    .min(1, "Enter your name.")
    .max(120, "Name must be 120 characters or fewer."),
  privacyAccepted: z.literal(true, {
    message: "Please accept the Privacy Policy and Terms to continue.",
  }),
  marketingOptIn: z.boolean(),
  website: z.string().max(255).optional(), // honeypot
};

/**
 * The traveller waitlist: a name, an email address, and consent.
 *
 * `whatsapp` is offered and never required. It used to be the other way round,
 * then briefly "one of the two", which needed a cross-field refinement *and* a
 * custom resolver to work around the fact that Zod skips object-level
 * `.refine()` when a field-level check has already failed. Requiring the one
 * channel we will definitely use removes the rule, the workaround and the
 * class of bug that came with them.
 */
const travellerSchema = z.object({
  ...sharedSchema,
  email: requiredEmailSchema,
  whatsapp: optionalPhoneSchema,
});

/**
 * The operator application: who you are, your business, and how to reach you.
 *
 * ## What came off it on 2026-08-07 (owner direction)
 *
 * `coverageDestinationKeys` ("Where do you operate?") and `primaryInterest`
 * ("What do you offer?"). Both are answered in the conversation that follows,
 * on the channel the applicant just gave us, and asking here made a
 * thirty-second application collect structured data nobody acts on before a
 * human is already talking to them. The destination list was also actively
 * wrong: the page invites operators outside the Andamans, and offered them
 * only Havelock, Neil and Port Blair to tick.
 *
 * `whatsapp` also stopped being required, for the same reason it is optional
 * for travellers.
 *
 * **All three relaxations need `yuvoy-in/yuvoy-api#4`**, which marks them
 * required on `ProviderLeadInput`. Until that deploys the API answers 422 —
 * see `unknownFieldErrors` in `ProviderForm`, which makes that failure
 * visible rather than silent.
 */
const providerSchema = z.object({
  ...sharedSchema,
  email: requiredEmailSchema,
  whatsapp: optionalPhoneSchema,
  businessName: z
    .string()
    .trim()
    .min(1, "Enter your business name.")
    .max(160, "Business name must be 160 characters or fewer."),
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
  /*
    The provider form is replaced by a notice while the API cannot accept what
    it sends (see `OPERATOR_FORM_LIVE`). Swapped here rather than at each call
    site so the three surfaces that render it — `/operators`, the `/waitlist`
    provider tab, and the `#providers` anchor those redirect through — cannot
    disagree about whether applying works.
  */
  const providerPanel = OPERATOR_FORM_LIVE ? (
    <ProviderForm context={context} />
  ) : (
    <ApplyComingSoon />
  );

  const forms = single ? (
    single === "traveller" ? (
      <TravellerForm context={context} />
    ) : (
      providerPanel
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
        {providerPanel}
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
                    Tell us who you are and we will get in touch when the first
                    experiences for your destination are ready. No spam, and no
                    payment required.
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
  contact,
}: {
  updated: boolean;
  audience: LeadAudience;
  /** What was actually recorded, read back so a typo can still be caught. */
  contact: { email?: string; whatsapp?: string };
}) {
  const provider = audience === "provider";
  const channels = [
    contact.email,
    contact.whatsapp ? formatForDisplay(contact.whatsapp) : undefined,
  ].filter(Boolean) as string[];

  return (
    <div role="status" className="border-cream/20 rounded-edge border p-8">
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
        <p className="text-cream/70 mt-4 leading-relaxed">
          The Yuvoy team will review it and contact you directly to talk through
          what you offer.
        </p>
      ) : (
        <p className="text-cream/70 mt-4 leading-relaxed">
          We will get in touch when experiences for your destination are ready.
          No spam, and no payment required.
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
        <div className="border-cream/20 mt-6 border-t pt-6">
          <p className="text-cream/70 text-sm leading-relaxed">
            We will use{" "}
            {channels.map((channel, i) => (
              <React.Fragment key={channel}>
                {i > 0 && " and "}
                <strong className="text-cream font-bold">{channel}</strong>
              </React.Fragment>
            ))}
            .
          </p>
          {/* A button, not a link: reading `window.location` during render
              would differ between the server pass and the client one, which
              is a hydration mismatch waiting for the day this notice renders
              anywhere other than after a click. */}
          <p className="text-cream/70 mt-2 text-sm leading-relaxed">
            Not right?{" "}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="text-cream focus-visible:ring-terra-soft rounded-edge underline underline-offset-2 focus-visible:ring-2 focus-visible:outline-none"
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
function ContactFields({
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
      <legend className="label text-cream/70">How can we reach you?</legend>
      <p id={`${prefix}-contact-hint`} className="text-cream/70 mb-1 text-sm">
        An email address is all we need. Add a WhatsApp number if you would
        rather we message you there.
      </p>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${prefix}-email`} className="label text-cream/70">
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
          <p className="text-cream/70 text-sm">
            Did you mean{" "}
            <button
              type="button"
              onClick={() => setValue(suggestion)}
              className="text-cream focus-visible:ring-terra-soft rounded-edge underline underline-offset-2 focus-visible:ring-2 focus-visible:outline-none"
            >
              {suggestion}
            </button>
            ?
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-1.5">
        <label htmlFor={`${prefix}-whatsapp`} className="label text-cream/70">
          WhatsApp number <span className="normal-case">(optional)</span>
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
function TravellerForm({ context }: { context: LeadContext }) {
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
    // Server-side field rejections map back onto the form fields.
    if (res.kind === "invalid") {
      for (const [field, message] of Object.entries(res.fields)) {
        setError(field as keyof TravellerValues, { message });
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

/* --------------------------------------------------------------- provider */

function ProviderForm({ context }: { context: LeadContext }) {
  const [result, setResult] = React.useState<SubmitResult | null>(null);
  const [submitted, setSubmitted] = React.useState<{
    email?: string;
    whatsapp?: string;
  }>({});
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
    const res = await submitLead({
      audience: "provider",
      contactName: values.contactName,
      // Already E.164 — PhoneField emits nothing else. Omitted rather than
      // sent empty: absence is what the contract means by optional.
      whatsapp: values.whatsapp || undefined,
      email: values.email,
      privacyAccepted: true,
      marketingOptIn: values.marketingOptIn,
      marketKey: LAUNCH_MARKET.key,
      source: context.source,
      website: values.website || undefined,
      businessName: values.businessName,
    });
    if (res.kind === "invalid") {
      /*
        Server field errors are mapped back onto the form — but **only the
        fields this form still has**.

        This is the guard for the window before yuvoy-in/yuvoy-api#4 deploys.
        The API currently marks `coverageDestinationKeys`, `primaryInterest`
        and `whatsapp` required on a provider lead; this form no longer asks
        for the first two and no longer requires the third, so a rejection
        names fields with no input to attach an error to. Handing those to
        `setError` puts the message on a field that never renders, and the
        applicant sees the button do nothing at all — the worst failure a form
        has, because it looks like a bug in their browser.

        Anything unrecognised is raised to the form's own error state instead,
        where it is visible and truthful.
      */
      const unknown: string[] = [];
      for (const [field, message] of Object.entries(res.fields)) {
        if (field in values) {
          setError(field as keyof ProviderValues, { message });
        } else {
          unknown.push(message);
        }
      }
      setUnknownFieldErrors(unknown);
    } else {
      setUnknownFieldErrors([]);
    }
    if (res.kind === "recorded" || res.kind === "updated") {
      setSubmitted({ email: values.email, whatsapp: values.whatsapp });
      track.submitted({
        marketKey: LAUNCH_MARKET.key,
        destinationKeys: [],
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
        audience="provider"
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
        Server-side rejections that name a field this form does not render.
        Until yuvoy-in/yuvoy-api#4 deploys, that is what a valid application
        gets back — so it is shown, plainly, rather than being swallowed by a
        `setError` call on an input that is not on screen.
      */}
      {unknownFieldErrors.length > 0 && (
        <div
          role="alert"
          className="border-terra-soft/40 rounded-edge border p-6"
        >
          <p className="font-display tracking-display text-xl font-normal">
            We couldn&rsquo;t save that.
          </p>
          <ul className="text-cream/70 mt-2 flex flex-col gap-1 text-sm">
            {unknownFieldErrors.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
          <p className="text-cream/70 mt-3 text-sm">
            Nothing was recorded. Please try again shortly.
          </p>
        </div>
      )}

      <ConsentFields
        privacyError={errors.privacyAccepted?.message}
        registerPrivacy={register("privacyAccepted")}
        registerMarketing={register("marketingOptIn")}
      />

      {/* The operator button says what the operator is doing. It read "Join
          the waitlist" until 2026-08-06, which is the traveller's action and
          the wrong promise: an operator is applying, and the difference
          between an application and a signup is the whole framing of the
          page this form sits on. */}
      <Button type="submit" variant="paper" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Sending…" : "Apply as a founding operator"}
      </Button>

      <p className="text-cream/70 text-xs">
        Pricing, capacity and listings come later, in conversation. This just
        opens the door.
      </p>
    </form>
  );
}
