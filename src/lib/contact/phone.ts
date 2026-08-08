import {
  countryByIso2,
  countryForE164,
  OTHER_COUNTRY,
  type Country,
} from "@/lib/contact/countries";

/**
 * Phone numbers: one canonical form, one validator.
 *
 * ## E.164 is not cosmetic here, it is correctness
 *
 * The API deduplicates leads on the **normalised contact** (see
 * `contracts/openapi.yaml`, `LeadInputBase`). If the same person submits
 * `+91 90000 00000` on their phone and `919000000000` on a laptop, and the
 * frontend passes both through untouched, the backend sees two different
 * strings and records two people. Normalising here, at the only place a phone
 * number enters the system, is what makes that dedupe work at all.
 *
 * The canonical form is E.164: a plus, the country code, the national number,
 * digits only. `+919000000000`. No spaces, no brackets, no leading zero.
 *
 * ## The trunk-zero rule
 *
 * Most of the world writes a national number with a leading `0` that is
 * dropped when dialling internationally: a British mobile printed `07400
 * 000000` is `+44 7400 000000`. People type what is printed, so the leading
 * zero is stripped rather than rejected — telling somebody their own number is
 * wrong, when they copied it correctly off their own screen, is the single
 * most common way a phone field loses a signup.
 *
 * Italy is the documented exception (its national numbers genuinely keep the
 * leading zero) and is not special-cased: stripping it there costs a landline
 * digit, which the generous 9–11 range still accepts, and mobile numbers —
 * what this field is actually for, since it is a WhatsApp number — never carry
 * one.
 */

/**
 * Digits only, plus a single leading `+`.
 *
 * ## Pasting a full international number is handled, not punished
 *
 * People paste. They paste `+91 90000 00000` out of a contacts app, and they
 * paste `0091...` off a business card, into a field sitting next to a country
 * selector that already says India. Appending the dial code to that produces
 * `+91919000000000` — a number that is silently wrong, passes a naive length
 * check in some countries, and is only discovered when a message never
 * arrives.
 *
 * So an input that announces itself as international (`+`, or the `00` trunk
 * prefix) is taken as the whole number and the selector is ignored. The field
 * then re-derives the country from it, so the two agree again on the next
 * render.
 */
/**
 * What a person is allowed to have typed into a phone field.
 *
 * ## Why the field needs this at all
 *
 * `toE164` strips everything that is not a digit, so a number typed as
 * `9a0b0c0` still *submits* correctly — which is exactly what made this
 * invisible. The field is a plain `type="tel"` input, and `type="tel"` does
 * not restrict characters in any browser; it only hints at a keypad. So the
 * letters sat there on screen, in a field that had silently agreed to ignore
 * them, and the visitor had no way to know which of the two was real (owner
 * report, 2026-08-08).
 *
 * Showing something other than what will be sent is the defect. A field that
 * refuses the keystroke is honest; one that accepts it and quietly drops it is
 * not.
 *
 * ## What survives
 *
 * Digits, and the separators people genuinely type or paste — spaces, hyphens,
 * dots and brackets — because `+91 (90000) 00000` is how numbers are written
 * down and rejecting the punctuation would reject the paste. `+` survives only
 * at the very start, where it means "this is the whole international number"
 * to `toE164`; anywhere else it is noise.
 *
 * Everything else is dropped, which includes the letters in a pasted
 * `tel:+919000000000` — so that paste lands as a clean `+919000000000`.
 */
export function sanitizePhoneInput(input: string): string {
  const kept = input.replace(/[^\d\s()+.-]/g, "");
  const international = /^\s*\+/.test(kept);
  const withoutPlus = kept.replace(/\+/g, "");
  return international ? `+${withoutPlus.replace(/^\s+/, "")}` : withoutPlus;
}

export function toE164(country: Country, nationalInput: string): string {
  const trimmed = nationalInput.trim();
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return "";

  if (trimmed.startsWith("+")) return `+${digits}`;
  // `00` is the international access prefix across most of the world. A
  // national number never begins with it, so this is unambiguous.
  if (digits.startsWith("00")) return `+${digits.slice(2)}`;

  if (country.iso2 === OTHER_COUNTRY.iso2) {
    // "Other" mode: the visitor types the whole international number.
    return `+${digits}`;
  }
  const national = digits.replace(/^0+/, "");
  return national ? `+${country.dial}${national}` : "";
}

/** The national part of an E.164 number, for redisplaying it in the field. */
export function nationalPart(e164: string): {
  country: Country;
  national: string;
} {
  const digits = e164.replace(/\D/g, "");
  const country = countryForE164(e164);
  if (!country) return { country: OTHER_COUNTRY, national: digits };
  return { country, national: digits.slice(country.dial.length) };
}

/**
 * What is wrong with this number, in words a visitor can act on, or null.
 *
 * A validator that only says "invalid" makes the visitor guess which of the
 * ten digits they got wrong. These messages name the actual problem, and the
 * length ones name the country, because "that looks too short for India" is
 * information and "invalid phone number" is not.
 *
 * Takes the E.164 string alone, so validation is a pure function of what will
 * actually be submitted — there is no way for the field's local state and the
 * validated value to disagree.
 */
export function phoneIssue(e164: string): string | null {
  if (!e164) return null; // Emptiness is the caller's business, not ours.

  if (!/^\+\d+$/.test(e164)) {
    return "Enter digits only, with your country code.";
  }

  const digits = e164.slice(1);

  // E.164's own ceiling. Nothing real exceeds 15 digits including the code.
  if (digits.length > 15) return "That number is too long.";

  const country = countryForE164(e164);
  if (!country) {
    // An unrecognised code is not necessarily wrong — the table is curated,
    // not exhaustive — so this only enforces the generic E.164 bounds.
    if (digits.length < OTHER_COUNTRY.min)
      return "That number looks too short.";
    return null;
  }

  const national = digits.length - country.dial.length;
  if (national === 0) return "Enter your number after the country code.";
  if (national < country.min) {
    return `That looks too short for ${country.name}. Expected ${describeLength(country)}.`;
  }
  if (national > country.max) {
    return `That looks too long for ${country.name}. Expected ${describeLength(country)}.`;
  }
  return null;
}

function describeLength(country: Country): string {
  return country.min === country.max
    ? `${country.min} digits`
    : `${country.min} to ${country.max} digits`;
}

/**
 * A number formatted for reading back to the visitor.
 *
 * Used in the success state, which is the only thing that catches a number
 * that is perfectly valid and simply not theirs. Grouped so it can be checked
 * at a glance: `+91 90000 00000` rather than `+919000000000`, which nobody
 * proofreads accurately.
 *
 * Deliberately naive — it groups, it does not apply each country's own
 * conventions. Getting French grouping subtly wrong would be worse than
 * grouping everything the same way, because a visitor would read the odd
 * spacing as a mistake in their number.
 *
 * **The rule is two halves**, the first taking the odd digit. Fixed-width
 * chunks were tried first and fail asymmetrically: chunking by five from the
 * right renders India perfectly (`90000 00000`) and Singapore as
 * `800 00000`, which reads as a mistyped number rather than a formatted one.
 * Halves give `90000 00000` and `8000 0000`, and degrade gracefully at every
 * length between 7 and 15.
 */
export function formatForDisplay(e164: string): string {
  const country = countryForE164(e164);
  if (!country) return e164;
  const national = e164.slice(1 + country.dial.length);
  if (national.length < 6) return `+${country.dial} ${national}`.trim();

  const split = Math.ceil(national.length / 2);
  return `+${country.dial} ${national.slice(0, split)} ${national.slice(split)}`;
}

/** Re-exported so form code has one import for the whole concern. */
export { countryByIso2, countryForE164, OTHER_COUNTRY };
export type { Country };
