/**
 * Dial codes and national-number lengths, curated.
 *
 * ## Why a table and not libphonenumber
 *
 * Google's library validates *carrier prefixes* — it knows that `+91 5…` is
 * not an assignable Indian mobile. That precision costs ~40KB gzipped of
 * metadata on a page whose entire performance budget is the reason the
 * photography got squeezed to 917KB. What actually catches typos is far
 * cheaper: **length**. A dropped digit, a doubled digit, a number pasted
 * without its area code — all of them change the length, and all of them are
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
 * both. **A false rejection is much worse than a false accept here** — a
 * visitor who is told their own phone number is invalid does not try again,
 * they leave. Germany's 6–12 looks sloppy and is correct: German subscriber
 * numbers genuinely run that wide.
 *
 * ## Coverage
 *
 * The list is every realistic source market for the Andamans (domestic India,
 * the European and Israeli dive markets, ASEAN, the Gulf, Anglosphere) plus
 * the major economies. Anything else uses `OTHER_COUNTRY`, which accepts a
 * full international number typed by hand — so nobody is ever locked out for
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

export const COUNTRIES: Country[] = [
  {
    iso2: "IN",
    name: "India",
    dial: "91",
    min: 10,
    max: 10,
    example: "98765 43210",
  },
  {
    iso2: "AE",
    name: "United Arab Emirates",
    dial: "971",
    min: 8,
    max: 9,
    example: "50 000 0000",
  },
  {
    iso2: "AR",
    name: "Argentina",
    dial: "54",
    min: 10,
    max: 11,
    example: "11 0000 0000",
  },
  {
    iso2: "AT",
    name: "Austria",
    dial: "43",
    min: 7,
    max: 13,
    example: "660 0000000",
  },
  {
    iso2: "AU",
    name: "Australia",
    dial: "61",
    min: 9,
    max: 9,
    example: "412 000 000",
  },
  {
    iso2: "BD",
    name: "Bangladesh",
    dial: "880",
    min: 10,
    max: 10,
    example: "1700 000000",
  },
  {
    iso2: "BE",
    name: "Belgium",
    dial: "32",
    min: 8,
    max: 9,
    example: "470 00 00 00",
  },
  {
    iso2: "BH",
    name: "Bahrain",
    dial: "973",
    min: 8,
    max: 8,
    example: "3600 0000",
  },
  {
    iso2: "BR",
    name: "Brazil",
    dial: "55",
    min: 10,
    max: 11,
    example: "11 90000 0000",
  },
  {
    iso2: "BT",
    name: "Bhutan",
    dial: "975",
    min: 7,
    max: 8,
    example: "17 000 000",
  },
  {
    iso2: "CA",
    name: "Canada",
    dial: "1",
    min: 10,
    max: 10,
    example: "416 000 0000",
  },
  {
    iso2: "CH",
    name: "Switzerland",
    dial: "41",
    min: 9,
    max: 9,
    example: "78 000 00 00",
  },
  {
    iso2: "CN",
    name: "China",
    dial: "86",
    min: 8,
    max: 11,
    example: "131 0000 0000",
  },
  {
    iso2: "CZ",
    name: "Czechia",
    dial: "420",
    min: 9,
    max: 9,
    example: "601 000 000",
  },
  {
    iso2: "DE",
    name: "Germany",
    dial: "49",
    min: 6,
    max: 12,
    example: "1512 0000000",
  },
  {
    iso2: "DK",
    name: "Denmark",
    dial: "45",
    min: 8,
    max: 8,
    example: "20 00 00 00",
  },
  {
    iso2: "ES",
    name: "Spain",
    dial: "34",
    min: 9,
    max: 9,
    example: "600 000 000",
  },
  {
    iso2: "FI",
    name: "Finland",
    dial: "358",
    min: 5,
    max: 12,
    example: "40 0000000",
  },
  {
    iso2: "FR",
    name: "France",
    dial: "33",
    min: 9,
    max: 9,
    example: "6 00 00 00 00",
  },
  {
    iso2: "GB",
    name: "United Kingdom",
    dial: "44",
    min: 9,
    max: 10,
    example: "7400 000000",
  },
  {
    iso2: "HK",
    name: "Hong Kong",
    dial: "852",
    min: 8,
    max: 8,
    example: "5100 0000",
  },
  {
    iso2: "ID",
    name: "Indonesia",
    dial: "62",
    min: 8,
    max: 12,
    example: "812 000 0000",
  },
  {
    iso2: "IE",
    name: "Ireland",
    dial: "353",
    min: 7,
    max: 9,
    example: "85 000 0000",
  },
  {
    iso2: "IL",
    name: "Israel",
    dial: "972",
    min: 8,
    max: 9,
    example: "50 000 0000",
  },
  {
    iso2: "IT",
    name: "Italy",
    dial: "39",
    min: 9,
    max: 11,
    example: "312 000 0000",
  },
  {
    iso2: "JP",
    name: "Japan",
    dial: "81",
    min: 9,
    max: 10,
    example: "90 0000 0000",
  },
  {
    iso2: "KR",
    name: "South Korea",
    dial: "82",
    min: 9,
    max: 10,
    example: "10 0000 0000",
  },
  {
    iso2: "KW",
    name: "Kuwait",
    dial: "965",
    min: 8,
    max: 8,
    example: "500 00000",
  },
  {
    iso2: "LK",
    name: "Sri Lanka",
    dial: "94",
    min: 9,
    max: 9,
    example: "71 000 0000",
  },
  {
    iso2: "MV",
    name: "Maldives",
    dial: "960",
    min: 7,
    max: 7,
    example: "770 0000",
  },
  {
    iso2: "MX",
    name: "Mexico",
    dial: "52",
    min: 10,
    max: 10,
    example: "55 0000 0000",
  },
  {
    iso2: "MY",
    name: "Malaysia",
    dial: "60",
    min: 7,
    max: 10,
    example: "12 000 0000",
  },
  {
    iso2: "NL",
    name: "Netherlands",
    dial: "31",
    min: 9,
    max: 9,
    example: "6 00000000",
  },
  {
    iso2: "NO",
    name: "Norway",
    dial: "47",
    min: 8,
    max: 8,
    example: "400 00 000",
  },
  {
    iso2: "NP",
    name: "Nepal",
    dial: "977",
    min: 8,
    max: 10,
    example: "980 0000000",
  },
  {
    iso2: "NZ",
    name: "New Zealand",
    dial: "64",
    min: 8,
    max: 10,
    example: "21 000 0000",
  },
  {
    iso2: "OM",
    name: "Oman",
    dial: "968",
    min: 8,
    max: 8,
    example: "9200 0000",
  },
  {
    iso2: "PH",
    name: "Philippines",
    dial: "63",
    min: 9,
    max: 10,
    example: "917 000 0000",
  },
  {
    iso2: "PL",
    name: "Poland",
    dial: "48",
    min: 9,
    max: 9,
    example: "512 000 000",
  },
  {
    iso2: "PT",
    name: "Portugal",
    dial: "351",
    min: 9,
    max: 9,
    example: "912 000 000",
  },
  {
    iso2: "QA",
    name: "Qatar",
    dial: "974",
    min: 8,
    max: 8,
    example: "3300 0000",
  },
  {
    iso2: "RU",
    name: "Russia",
    dial: "7",
    min: 10,
    max: 10,
    example: "912 000 0000",
  },
  {
    iso2: "SA",
    name: "Saudi Arabia",
    dial: "966",
    min: 8,
    max: 9,
    example: "51 000 0000",
  },
  {
    iso2: "SE",
    name: "Sweden",
    dial: "46",
    min: 7,
    max: 9,
    example: "70 000 00 00",
  },
  {
    iso2: "SG",
    name: "Singapore",
    dial: "65",
    min: 8,
    max: 8,
    example: "8000 0000",
  },
  {
    iso2: "TH",
    name: "Thailand",
    dial: "66",
    min: 8,
    max: 9,
    example: "81 000 0000",
  },
  {
    iso2: "TR",
    name: "Turkey",
    dial: "90",
    min: 10,
    max: 10,
    example: "501 000 0000",
  },
  {
    iso2: "TW",
    name: "Taiwan",
    dial: "886",
    min: 8,
    max: 9,
    example: "912 000 000",
  },
  {
    iso2: "US",
    name: "United States",
    dial: "1",
    min: 10,
    max: 10,
    example: "201 000 0000",
  },
  {
    iso2: "VN",
    name: "Vietnam",
    dial: "84",
    min: 9,
    max: 9,
    example: "91 000 0000",
  },
  {
    iso2: "ZA",
    name: "South Africa",
    dial: "27",
    min: 9,
    max: 9,
    example: "71 000 0000",
  },
];

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
