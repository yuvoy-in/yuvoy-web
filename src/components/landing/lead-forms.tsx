"use client";

import * as React from "react";
import { Controller, useForm, useWatch, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneField } from "@/components/ui/phone-field";
import { FaqAccordion } from "@/components/site/faq-accordion";
import { AUDIENCE_COPY } from "@/lib/site/audiences";
import { submitLead, type SubmitResult } from "@/lib/leads/api";
import {
  submitOperatorApplication,
  type ApplicationResult,
} from "@/lib/operators/api";
import { useLeadAnalytics } from "@/lib/analytics/use-lead-analytics";
import { formatForDisplay, phoneIssue } from "@/lib/contact/phone";
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
 * **All three relaxations shipped on 2026-08-07** (`yuvoy-in/yuvoy-api#4`,
 * verified against production with the exact email-only payload this form
 * sends). Until they did, the deployed API answered 400 to every complete
 * application and this form stood down behind a notice; `unknownFieldErrors`
 * in `ProviderForm` is what made that failure visible rather than silent, and
 * it stays for the next rejection nobody predicted.
 *
 * ## `whatsapp` is required again here, and only here (2026-09-07)
 *
 * It stopped being required with the other two, when this form only filed a
 * marketing lead. It now also files an **application**, and
 * `POST /operator-applications` requires `phone` — "the three fields needed to
 * have a conversation: the business, a person, and a number that can be
 * dialled."
 *
 * The two endpoints set different bars on purpose and both are right. A lead
 * needs any way to reach somebody, because "some operators will not hand a
 * personal mobile number to a pre-launch platform". An application is a row a
 * human picks up and rings; one with no number is not an application, it is a
 * note.
 *
 * So the number is asked for on the operator form and nowhere else — the
 * traveller waitlist is untouched. The trade is deliberate: a phone-averse
 * operator now bounces off the form rather than filing something the
 * onboarding queue could never act on, which is what happened to two real
 * businesses for a month (yuvoy-web#144).
 */
const providerSchema = z.object({
  ...sharedSchema,
  email: requiredEmailSchema,
  whatsapp: z
    .string()
    .trim()
    .min(1, "Enter a number we can call you on.")
    .superRefine(phoneIssueCheck),
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
 * The form for one audience — the traveller waitlist, or the operator
 * application.
 *
 * The operator side stood as a "Coming soon" notice until 2026-08-07, because
 * the deployed API still required three fields the form had stopped asking
 * for and answered `400` to every complete application. `yuvoy-in/yuvoy-api#4`
 * shipped and the notice went with it; both surfaces that render this — the
 * `/waitlist` operator tab and `/operators` — got the real form in the same
 * change, which is the point of there being one component.
 *
 * Exported because `/waitlist` composes the two sides itself: there, the
 * audience switch changes the whole page rather than only the form, so it
 * needs the panel without the section around it.
 */
export function LeadFormPanel({
  audience,
  context,
}: {
  audience: LeadAudience;
  context: LeadContext;
}) {
  return audience === "traveller" ? (
    <TravellerForm context={context} />
  ) : (
    <ProviderForm context={context} />
  );
}

/**
 * Registration as a page section: the narrative on the left, the form on the
 * right. Every form posts to POST /v1/leads with the audience discriminator,
 * and every outcome the API can produce — recorded, updated, invalid,
 * rate-limited, unavailable, offline — has its own truthful UI state.
 *
 * **One audience, always.** The homepage speaks to travellers and `/operators`
 * speaks to operators, and neither should show the other's door. The audience
 * picker that used to live here moved to `/waitlist`, which is the one surface
 * that offers both — and it belongs there rather than here, because choosing a
 * side changes everything on that page, not just which fields are on screen.
 */
export function LeadForms({
  context,
  audience,
  aside,
  sectionId = "register",
}: {
  context: LeadContext;
  audience: LeadAudience;
  /**
   * The narrative column. It **must** contain an element with
   * `id="${sectionId}-heading"` (see `JoinAside` / `ApplyAside`), because it
   * carries the section's heading and this section points its
   * `aria-labelledby` at it.
   */
  aside: React.ReactNode;
  /** The section's anchor id; its heading is `<id>-heading`. */
  sectionId?: string;
}) {
  return (
    <section
      id={sectionId}
      className="bg-forest text-paper scroll-mt-[calc(4rem+env(safe-area-inset-top))]"
      aria-labelledby={`${sectionId}-heading`}
    >
      {/* The legacy operator anchor, wherever a provider form actually lives,
          so the browser has something to scroll to. The homepage no longer
          offers that form and redirects the anchor instead (see
          LegacyProviderAnchor). */}
      {audience === "provider" && (
        <span
          id="providers"
          className="block scroll-mt-[calc(5rem+env(safe-area-inset-top))]"
          aria-hidden
        />
      )}
      {/*
        Three cells, and the source order is the PHONE's order: headline, then
        the form, then the questions.

        Stacked into one column the old two-cell version read headline →
        questions → form, so a visitor on a phone had to scroll past every FAQ
        to reach the thing the section is asking them to do (owner report,
        2026-08-10). Desktop was right and is unchanged: the questions sit
        under the headline on the left and the form holds the right.

        That is why the form is its own cell rather than living inside the
        aside — with explicit placement the same DOM serves both orders, so
        nothing is reordered by CSS alone and the focus order a keyboard user
        gets is the reading order everyone else gets.

        `grid-rows-[auto_1fr]`: a form taller than the column beside it should
        grow the QUESTIONS row. With two auto rows grid splits the excess
        between them and opens a gap between the headline and the first
        question. This is the same shape `WaitlistFlow` uses, for the same
        reason.
      */}
      <div className="container-page py-14 sm:py-28">
        <div className="grid grid-cols-1 gap-10 sm:gap-14 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-x-20 lg:gap-y-14">
          <div className="lg:col-start-1 lg:row-start-1">{aside}</div>

          <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <LeadFormPanel audience={audience} context={context} />
          </div>

          {/* Rendered here rather than inside the aside so it can be placed
              independently. It also puts the questions in one place for all
              three surfaces that ask them, keyed off the audience this
              section already knows. */}
          <div className="lg:col-start-1 lg:row-start-2">
            <FaqAccordion items={AUDIENCE_COPY[audience].faqs} tone="ink" />
          </div>
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

function SuccessNotice({
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
            */
            <>
              We have your application. You do not have to wait for us: you can
              set your business up at operators.yuvoy.in with this number now.
            </>
          )}
        </p>
      ) : (
        <p className="text-paper/70 mt-4 leading-relaxed">
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

function ProviderForm({ context }: { context: LeadContext }) {
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

      {/* The operator button says what the operator is doing. It read "Join
          the waitlist" until 2026-08-06, which is the traveller's action and
          the wrong promise: an operator is applying, and the difference
          between an application and a signup is the whole framing of the
          page this form sits on. */}
      <Button type="submit" variant="paper" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Sending…" : "Apply as a founding operator"}
      </Button>

      <p className="text-paper/70 text-xs">
        Pricing, capacity and listings come later, in conversation. This just
        opens the door.
      </p>
    </form>
  );
}
