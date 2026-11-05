import { COUNTRIES } from "@/lib/contact/country-list";

/**
 * Dial codes and national-number lengths, curated.
 *
 * ## Why a table and not libphonenumber
 *
 * Google's library validates *carrier prefixes*: it knows that `+91 5…` is
 * not an assignable Indian mobile. That precision costs ~40KB gzipped of
 * metadata on a page whose entire performance budget is the reason the
 * photography got squeezed to 917KB. What actually catches typos is far
 * cheaper: **length**. A dropped digit, a doubled digit, a number pasted
 * without its area code: all of them change the length, and all of them are
 * what real people actually get wrong.
 *
 * So this table validates *possibility*, not *assignment*. It will accept a
 * well-formed number that happens to be unassigned. That is the correct trade
 * for a waitlist: the cost of accepting one unassigned number is nothing (we
 * message it and it bounces), and the cost of rejecting a valid one is a lost
 * signup and a support conversation.
 *
 * ## Ranges are deliberately generous
 *
 * Where a country's landlines and mobiles differ in length, the range spans
 * both. **A false rejection is much worse than a false accept here**: a
 * visitor who is told their own phone number is invalid does not try again,
 * they leave. Germany's 6 to 12 looks sloppy and is correct: German subscriber
 * numbers genuinely run that wide.
 *
 * ## Coverage
 *
 * The list is every realistic source market for the Andamans (domestic India,
 * the European and Israeli dive markets, ASEAN, the Gulf, Anglosphere) plus
 * the major economies. Anything else uses `OTHER_COUNTRY`, which accepts a
 * full international number typed by hand, so nobody is ever locked out for
 * living somewhere the list forgot.
 */

export interface Country {
  /** ISO 3166-1 alpha-2, and the value stored in the select. */
  iso2: string;
  name: string;
  /** Dial code without the plus. */
  dial: string;
  /** Inclusive length range of the national number, digits only. */
  min: number;
  max: number;
  /** Placeholder showing this country's own shape. Digits only, no code. */
  example: string;
}

/**
 * The escape hatch, and the reason no visitor can be locked out.
 *
 * Selecting it switches the field to a single full-international input. The
 * bounds are E.164's own: a country code plus a subscriber number is at most
 * 15 digits, and nothing real is shorter than 7.
 */
export const OTHER_COUNTRY: Country = {
  iso2: "ZZ",
  name: "Other country",
  dial: "",
  min: 7,
  max: 15,
  example: "+380 44 000 0000",
};

export { COUNTRIES };

/** India first, then alphabetical: the launch market leads its own form. */
export const COUNTRY_OPTIONS: Country[] = [
  ...COUNTRIES.slice(0, 1),
  ...COUNTRIES.slice(1).sort((a, b) => a.name.localeCompare(b.name)),
  OTHER_COUNTRY,
];

export const DEFAULT_COUNTRY = COUNTRIES[0];

export function countryByIso2(iso2: string): Country {
  if (iso2 === OTHER_COUNTRY.iso2) return OTHER_COUNTRY;
  return COUNTRIES.find((c) => c.iso2 === iso2) ?? DEFAULT_COUNTRY;
}

/**
 * Which country an E.164 number belongs to, by longest matching dial code.
 *
 * **Longest match, not first match**, and this is the whole reason the lookup
 * is a function rather than a map: `+1` (US) is a prefix of nothing, but `+7`
 * (Russia) is a prefix of `+7` alone while `+9` opens `+91`, `+94`, `+960`,
 * `+966`, `+971`, `+972`, `+975` and `+977`. A first match on a naively
 * ordered list would file every Maldivian number under India.
 *
 * `+1` is shared by the US and Canada with no way to tell them apart from the
 * number alone; the first entry wins, which only affects which flag redisplays
 * on an edit. The stored value is identical either way.
 */
export function countryForE164(e164: string): Country | null {
  const digits = e164.replace(/\D/g, "");
  let best: Country | null = null;
  for (const country of COUNTRIES) {
    if (!digits.startsWith(country.dial)) continue;
    if (!best || country.dial.length > best.dial.length) best = country;
  }
  return best;
}
