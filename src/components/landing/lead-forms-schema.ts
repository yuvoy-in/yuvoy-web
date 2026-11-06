import { z } from "zod";
import { phoneIssue } from "@/lib/contact/phone";
import { isPlausibleEmail } from "@/lib/contact/email";

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
export const travellerSchema = z.object({
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
export const providerSchema = z.object({
  ...sharedSchema,
  /*
    At least 2 characters on this form only (yuvoy-web#190): `POST
    /v1/host-applications` sets minLength 2 on both names, while `/v1/leads`,
    which the traveller form calls, keeps 1. A one-letter name used to pass
    here and come back as a 400 with no field named.
  */
  contactName: sharedSchema.contactName.min(
    2,
    "Name must be at least 2 characters.",
  ),
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
    .min(2, "Business name must be at least 2 characters.")
    .max(160, "Business name must be 160 characters or fewer."),
});

export type TravellerValues = z.infer<typeof travellerSchema>;
export type ProviderValues = z.infer<typeof providerSchema>;

/**
 * Where each part of a host application's 400 goes (yuvoy-web#190).
 *
 * A field this form renders gets its own message. `contact` goes on the email
 * input, since email is the channel this form requires. Anything else is shown
 * in the form's own error box. When the API named no field at all, its own
 * sentence goes in that box, so a refusal is never a button that does nothing.
 */
export function placeServerErrors(
  fields: Record<string, string>,
  known: readonly string[],
  message: string,
): { onFields: [keyof ProviderValues, string][]; shown: string[] } {
  const onFields: [keyof ProviderValues, string][] = [];
  const shown: string[] = [];
  for (const [field, text] of Object.entries(fields)) {
    if (known.includes(field)) {
      onFields.push([field as keyof ProviderValues, text]);
    } else if (field === "contact") {
      onFields.push(["email", text]);
    } else {
      shown.push(text);
    }
  }
  if (onFields.length === 0 && shown.length === 0) shown.push(message);
  return { onFields, shown };
}
