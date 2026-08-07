/**
 * Email typo detection.
 *
 * ## It suggests, it never rejects
 *
 * Every function here returns a *suggestion*. Nothing in this file can make a
 * submission fail. That is the whole design: domain blocklists and "smart"
 * validators are how real addresses get refused, and a person whose own email
 * is called invalid does not file a bug, they leave. The form accepts what it
 * is given; this only offers a one-tap correction when a mistake is nearly
 * certain.
 *
 * ## Why a table and not an edit-distance library
 *
 * Levenshtein against a list of popular domains is the usual approach and it
 * is worse. It fires on real domains that happen to sit one character from a
 * popular one (`gmail.co` is a legitimate Kenyan-style domain shape;
 * `hotmai.fr` exists), and it needs tuning per-domain to stop doing that. An
 * explicit table of the typos people actually make is smaller, has no false
 * positives by construction, and is trivial to extend when a new one shows up
 * in real submissions.
 *
 * The entries below are the documented high-frequency misspellings of the
 * four providers that carry most consumer email, plus the TLD slips that come
 * from a fat finger on the key next to the intended one.
 */

/** Whole-domain corrections. Exact match, so it cannot misfire. */
const DOMAIN_TYPOS: Record<string, string> = {
  // gmail
  "gmial.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gmail.co": "gmail.com",
  "gmail.cm": "gmail.com",
  "gmail.con": "gmail.com",
  "gmaill.com": "gmail.com",
  "gnail.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gmail.comm": "gmail.com",
  "gmail.om": "gmail.com",
  "gmail.xom": "gmail.com",
  "ggmail.com": "gmail.com",
  // yahoo
  "yaho.com": "yahoo.com",
  "yahooo.com": "yahoo.com",
  "yahoo.co": "yahoo.com",
  "yahoo.con": "yahoo.com",
  "yhaoo.com": "yahoo.com",
  "yahoo.cm": "yahoo.com",
  // hotmail
  "hotmial.com": "hotmail.com",
  "hotmai.com": "hotmail.com",
  "hotmail.co": "hotmail.com",
  "hotmail.con": "hotmail.com",
  "hotmail.cm": "hotmail.com",
  "hotnail.com": "hotmail.com",
  // outlook
  "outlok.com": "outlook.com",
  "outllok.com": "outlook.com",
  "outlook.co": "outlook.com",
  "outlook.con": "outlook.com",
  "oulook.com": "outlook.com",
  // icloud / proton / indian providers
  "iclould.com": "icloud.com",
  "icloud.con": "icloud.com",
  "protonmial.com": "protonmail.com",
  "rediffmail.co": "rediffmail.com",
  "rediff.con": "rediff.com",
};

/**
 * TLD slips, applied only when the domain body is otherwise untouched.
 *
 * Scoped to the exact endings a keyboard produces: `n` and `m` are adjacent,
 * as are `o` and `p`. `.co` is deliberately **not** here as a blanket rule —
 * `.co` is a real TLD and `something.co` is a real address; it is corrected
 * only inside `DOMAIN_TYPOS`, where the domain body proves the intent.
 */
const TLD_TYPOS: Record<string, string> = {
  ".con": ".com",
  ".cmo": ".com",
  ".ocm": ".com",
  ".cpm": ".com",
  ".xom": ".com",
  ".vom": ".com",
  ".comm": ".com",
  ".couk": ".co.uk",
  ".ne": ".net",
  ".orgg": ".org",
};

/**
 * A corrected address, or null when nothing is obviously wrong.
 *
 * Case is preserved in the local part (some servers are case-sensitive there)
 * and normalised in the domain (DNS never is), so the suggestion a visitor
 * sees differs from what they typed only where it genuinely should.
 */
export function suggestEmail(raw: string): string | null {
  const value = raw.trim();
  const at = value.lastIndexOf("@");
  if (at <= 0 || at === value.length - 1) return null;

  const local = value.slice(0, at);
  const domain = value.slice(at + 1).toLowerCase();
  if (!domain.includes(".")) return null;

  const whole = DOMAIN_TYPOS[domain];
  if (whole) return `${local}@${whole}`;

  for (const [wrong, right] of Object.entries(TLD_TYPOS)) {
    if (domain.endsWith(wrong)) {
      const fixed = `${domain.slice(0, -wrong.length)}${right}`;
      // Guard against a "correction" that changes nothing, which would render
      // a suggestion identical to the input and read as a broken hint.
      if (fixed !== domain) return `${local}@${fixed}`;
    }
  }

  return null;
}

/**
 * Whether an address is structurally plausible.
 *
 * Deliberately looser than the RFC and looser than most regexes found online.
 * The only things it rejects are shapes that cannot be delivered under any
 * reading: no `@`, nothing before or after it, a domain with no dot, or
 * whitespace. Anything else is the mail server's business, not ours — and
 * every additional rule is another way to refuse somebody's real address.
 */
export function isPlausibleEmail(raw: string): boolean {
  const value = raw.trim();
  if (/\s/.test(value)) return false;
  const at = value.lastIndexOf("@");
  if (at <= 0 || at === value.length - 1) return false;
  const domain = value.slice(at + 1);
  return /^[^.@]+(\.[^.@]+)+$/.test(domain);
}
