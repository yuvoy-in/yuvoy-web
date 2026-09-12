/**
 * An em dash, removed from text this portal did not write.
 *
 * yuvoy-api writes its own sentences and we print them. The copy rule (no em
 * dash in anything a visitor reads) cannot reach another team's database,
 * so it is applied here, on the way in, rather than at each screen that
 * happens to render one of these fields.
 *
 * This changes PUNCTUATION ONLY and never a word. Here it meets the validation
 * messages behind the lead, operator and message forms: `error.message` and
 * every string in `error.details`, which are printed against a field.
 *
 * A FULL STOP, not a comma, for a single break. Almost every string this meets
 * is two independent clauses joined by a dash, and a comma splices them. The
 * capacity refusal is the case that decided it: with a comma, "Cancel the
 * bookings you cannot take first, we will refund them" reads as us announcing
 * the refund as our next step rather than as the consequence of the operator
 * cancelling. On a refund screen that is a different instruction, not a
 * different style. A full stop cannot be misread that way.
 *
 * The exception is a tail that cannot stand on its own, such as one opening
 * with a participle or a preposition. A full stop there would leave a
 * fragment, so those take a comma instead.
 *
 * An en dash counts as a long dash too, so a range arriving from the API
 * comes out as a plain hyphen. Owner direction 2026-09-12.
 */

// Written as escapes so this file does not trip `scripts/check-no-em-dashes.mjs`.
const EM_DASH = "\u2014";
const EN_DASH = "\u2013";
const HORIZONTAL_BAR = "\u2015";
const DASH = `[${EM_DASH}${EN_DASH}${HORIZONTAL_BAR}]`;

const HAS_DASH = new RegExp(DASH);
/** A range, which a hyphen says without the slop. */
const NUMERIC_RANGE = new RegExp(`(\\d)\\s*${DASH}\\s*(\\d)`, "g");
/** A matched pair inside one sentence is an aside, so make it look like one. */
const PARENTHETICAL = new RegExp(
  `\\s*${DASH}\\s*([^${EM_DASH}${EN_DASH}${HORIZONTAL_BAR}.!?]+?)\\s*${DASH}\\s*`,
  "g",
);
/** Any remaining dash, plus the character after it so it can be capitalised. */
const SINGLE = new RegExp(`\\s*${DASH}\\s*(.?)`, "g");

/**
 * Openers that cannot begin an independent clause. Deliberately short: a word
 * missing from it only costs a comma where a full stop would have read better,
 * while a wrong entry can never produce a fragment.
 */
const CANNOT_STAND_ALONE =
  /^(includ|exclud|leav|giv|tak|mak|bring|carry|mean|start|end|and\b|but\b|or\b|nor\b|so\b|yet\b|because\b|although\b|though\b|while\b|whereas\b|which\b|who\b|whose\b|whom\b|that\b|with\b|without\b|for\b|from\b|to\b|at\b|in\b|on\b|by\b|of\b|as\b|like\b|than\b|up\b|down\b|over\b|under\b|after\b|before\b|since\b|until\b|unless\b|not\b)/i;

/** Punctuation the sentence already carries, which must never be stacked. */
const ALREADY_PUNCTUATED = /[,;:.!?([]$/;
const OPENS_WITH_PUNCTUATION = /^[,;:.!?)\]]/;

export function dedash(text: string): string {
  if (!HAS_DASH.test(text)) return text;

  return text
    .replace(NUMERIC_RANGE, "$1-$2")
    .replace(PARENTHETICAL, " ($1) ")
    .replace(SINGLE, (match, next: string, offset: number, whole: string) => {
      const before = whole.slice(0, offset).replace(/[ \t]+$/, "");
      const tail = whole.slice(offset + match.length - next.length);
      // A dash opening or closing a line is decoration, not punctuation.
      if (!before || !tail || /\n$/.test(before)) return next;
      if (ALREADY_PUNCTUATED.test(before)) return ` ${next}`;
      if (OPENS_WITH_PUNCTUATION.test(next)) return next;
      if (CANNOT_STAND_ALONE.test(tail)) return `, ${next}`;
      return `. ${next.toUpperCase()}`;
    })
    .replace(/ {2,}/g, " ")
    .replace(/ +([.,;:!?])/g, "$1")
    .trim();
}

/**
 * The same, for a field that may be absent. Optional API fields are the common
 * case at this boundary, and unwrapping each one at the call site buried the
 * point of the call.
 */
export function dedashText<T extends string | null | undefined>(text: T): T {
  return (typeof text === "string" ? dedash(text) : text) as T;
}

/** A `JSON.parse` reviver, for cleaning a whole response body in one pass. */
export function dedashReviver(_key: string, value: unknown): unknown {
  return typeof value === "string" ? dedash(value) : value;
}
