"use client";

import * as React from "react";
import { cn } from "@/lib/cn";
import {
  COUNTRY_OPTIONS,
  DEFAULT_COUNTRY,
  OTHER_COUNTRY,
} from "@/lib/contact/countries";
import {
  countryByIso2,
  countryForE164,
  nationalPart,
  sanitizePhoneInput,
  toE164,
} from "@/lib/contact/phone";

/**
 * A phone field that produces E.164 and nothing else.
 *
 * ## The contract
 *
 * `value` and `onChange` speak E.164 (`+919000000000`) or the empty string.
 * The country selection is *presentation*: it exists so a visitor types only
 * the digits they know, and it is re-derived from `value` on the way back in.
 * There is no way for the field's local state and the submitted value to drift
 * apart, because the submitted value is computed from both parts on every
 * keystroke rather than mirrored into a second piece of state.
 *
 * ## Why a native `<select>`
 *
 * A custom combobox with flags and search is the fashionable answer and the
 * wrong one. Native gets us, for free and correctly: keyboard operation,
 * type-ahead ("ger" jumps to Germany), the iOS wheel and the Android sheet,
 * screen-reader semantics that cannot drift from the markup, and zero
 * JavaScript for the interaction itself. What it costs is a bespoke chevron,
 * which is a styling problem, not an accessibility one.
 *
 * Country names carry their dial code in the option text (`India +91`) rather
 * than only as a flag, because a flag is not readable by assistive tech, does
 * not render on every platform, and cannot be typed at.
 *
 * ## The "Other country" mode
 *
 * The table is curated, so somebody's country will eventually be missing. In
 * that mode the single input takes the whole international number and the
 * dial-code prefix disappears. Two modes is a real cost; being unable to join
 * a waitlist because you live in Ukraine is a bigger one.
 */
export function PhoneField({
  id,
  value,
  onChange,
  onBlur,
  tone = "onLight",
  invalid,
  describedBy,
  autoComplete = "tel",
}: {
  id: string;
  value: string;
  onChange: (e164: string) => void;
  onBlur?: () => void;
  tone?: "onLight" | "onDark";
  invalid?: boolean;
  describedBy?: string;
  autoComplete?: string;
}) {
  const dark = tone === "onDark";

  /**
   * The country is remembered rather than always derived, for one case that
   * matters: an empty field. `nationalPart("")` cannot know whether the
   * visitor had picked Germany a moment ago and then cleared the digits, so
   * deriving alone would snap the select back to India mid-edit. State holds
   * the choice; the value stays the source of truth for everything else.
   */
  const derived = value ? nationalPart(value) : null;
  const [iso2, setIso2] = React.useState(
    derived?.country.iso2 ?? DEFAULT_COUNTRY.iso2,
  );
  const country = countryByIso2(iso2);
  const isOther = country.iso2 === OTHER_COUNTRY.iso2;

  /*
    What the input displays. Derived from `value` whenever the two agree, so
    a programmatic reset (the form clearing, a saved value loading) shows up
    immediately without an effect to synchronise it.

    Local state exists only to preserve what was literally typed while it is
    being typed: `toE164` strips a trailing separator, so echoing the derived
    value back would delete the space the moment somebody typed it.
  */
  const [typed, setTyped] = React.useState("");
  const displayed = React.useMemo(() => {
    if (toE164(country, typed) === value) return typed;
    if (!value) return "";
    if (isOther) return value;
    const part = nationalPart(value);
    return part.country.iso2 === country.iso2 ? part.national : value;
  }, [country, isOther, typed, value]);

  function selectCountry(nextIso2: string) {
    setIso2(nextIso2);
    // Recompute against the new country so the stored value follows the
    // select immediately, rather than waiting for the next keystroke.
    onChange(toE164(countryByIso2(nextIso2), typed || displayed));
  }

  /**
   * Everything typed, pasted, dropped or autofilled into the number cell.
   *
   * Sanitising here rather than only on submit is the point: `toE164` already
   * ignores anything that is not a digit, so `9a0b0c` submitted correctly and
   * *looked* wrong — a field showing something other than what it will send
   * (owner report, 2026-08-08). `type="tel"` restricts nothing in any browser;
   * it only asks for a keypad.
   */
  function handleInput(event: React.ChangeEvent<HTMLInputElement>) {
    const element = event.target;
    const raw = element.value;
    const next = sanitizePhoneInput(raw);

    /*
      React re-renders when something it owns changes, and a rejected keystroke
      frequently changes nothing: typing a letter into an empty field leaves
      both `typed` and the E.164 value at "". With no re-render, the character
      React never accepted would sit in the DOM anyway — the classic controlled
      -input hole. So put the element back by hand.

      And put the caret back with it. Assigning `value` alone drops it at the
      end, which turns one fumbled key in the middle of a number into a jump to
      the end of it. What is restored is the position minus however many
      characters were dropped *before* it.
    */
    if (next !== raw) {
      const caret = element.selectionStart ?? raw.length;
      const dropped = caret - sanitizePhoneInput(raw.slice(0, caret)).length;
      element.value = next;
      const restored = Math.max(0, caret - dropped);
      element.setSelectionRange(restored, restored);
    }

    typeNumber(next);
  }

  function typeNumber(next: string) {
    setTyped(next);
    const e164 = toE164(country, next);
    onChange(e164);

    /*
      A pasted international number overrides the selector (see `toE164`), so
      the control has to settle back into its two halves — otherwise it reads
      "India" above a Ukrainian number and the visitor has no way to tell which
      one the form believed.

      Only on an explicit international paste, and only when the code is one we
      recognise: re-deriving on every keystroke would fight somebody part-way
      through typing, since a half-typed number matches whatever country its
      first digits happen to look like.

      **The split is released whether or not the country changed** (fixed
      2026-08-08). It used to be conditional on the country being different,
      which left the one case nobody tests: pasting `+919000000000` while India
      was already selected kept the whole international string in the *national*
      cell, so the field read `+91` `+919000000000`. The submitted value was
      right and the field looked broken — and it is the most likely paste there
      is, since India is the default.
    */
    const international =
      next.trim().startsWith("+") || /^0{2}/.test(next.trim());
    if (!international) return;
    const derivedCountry = countryForE164(e164);
    if (!derivedCountry) return;
    if (derivedCountry.iso2 !== iso2) setIso2(derivedCountry.iso2);
    // What is displayed is derived from `value`, so the raw paste has to be
    // released or it would keep winning over the national part.
    setTyped("");
  }

  /*
    One field, two cells: a narrow code cell and a wide number cell, sharing a
    single border and a single focus ring.

    ## How the code cell avoids the overflow that killed the first attempt

    A native `<select>` in normal flow is at least as wide as its longest
    option, so "United Arab Emirates +971" beside a number input pushed the
    document 46px past the viewport at 360px. Stacking the two controls fixed
    it and looked like two fields.

    The select is now **absolutely positioned and transparent**, filling the
    code cell and sitting over it. Out of flow, it contributes no intrinsic
    width at all, so the overflow is structurally impossible rather than
    merely tuned away — the cell is exactly `w-[5.75rem]`, whatever the option
    list says. What the visitor sees underneath is the dial code and a
    chevron, drawn to match the rest of the system.

    `opacity-0` rather than `hidden` or `text-transparent`: the element must
    stay hit-testable and focusable, and browsers render the *popup* from
    their own chrome, so a transparent control still opens a fully legible
    native picker. This keeps everything native gives us — type-ahead ("ger"
    jumps to Germany), the iOS wheel, the Android sheet, keyboard operation,
    and screen-reader semantics that cannot drift from the markup — while the
    closed state shows only what a closed state needs to.

    The visible layer is `aria-hidden`: the select is the control, and its
    value is already announced. Duplicating "+91" into the accessibility tree
    would have it read twice.
  */
  return (
    <div
      className={cn(
        "rounded-edge flex h-12 w-full overflow-hidden border transition-colors duration-200",
        dark
          ? "border-cream/20 bg-cream/5 focus-within:border-terra-soft focus-within:ring-terra-soft/40"
          : "border-forest/20 bg-cream-deep focus-within:border-terra-deep focus-within:ring-terra-deep/30",
        "focus-within:ring-2",
        invalid && (dark ? "border-terra-soft" : "border-terra-deep"),
      )}
    >
      <div className="relative w-23 flex-none">
        <select
          // Its own accessible name: the visible label belongs to the number
          // input, and "WhatsApp number" is not what this control sets.
          aria-label="Country code"
          value={iso2}
          onChange={(event) => selectCountry(event.target.value)}
          onBlur={onBlur}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        >
          {COUNTRY_OPTIONS.map((option) => (
            <option
              key={option.iso2}
              value={option.iso2}
              // Options inherit the page's colours on some platforms and the
              // system's on others; forcing both keeps a dark-surface select
              // from rendering cream-on-cream when opened.
              className="bg-cream text-forest"
            >
              {option.dial ? `${option.name} +${option.dial}` : option.name}
            </option>
          ))}
        </select>

        <div
          aria-hidden
          className={cn(
            "pointer-events-none flex h-full items-center gap-1.5 pr-3 pl-4 text-sm",
            dark ? "text-cream" : "text-forest",
          )}
        >
          <span className="flex-1 truncate">
            {country.dial ? `+${country.dial}` : "Other"}
          </span>
          <svg
            viewBox="0 0 12 12"
            fill="none"
            className={cn(
              "size-3 flex-none",
              dark ? "text-cream/60" : "text-forest/70",
            )}
          >
            <path
              d="M2.5 4.5L6 8l3.5-3.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="square"
            />
          </svg>
        </div>
      </div>

      {/* The divider between the cells, at the same weight as the outer
          border so the pair reads as one ruled field. */}
      <span
        aria-hidden
        className={cn(
          "w-px self-stretch",
          dark ? "bg-cream/20" : "bg-forest/20",
        )}
      />

      <input
        id={id}
        type="tel"
        inputMode="tel"
        // `tel-national` tells the browser to autofill the number *without*
        // the country code, which is exactly what this cell holds. Plain
        // `tel` would paste the full international number into it and produce
        // a doubled dial code.
        autoComplete={isOther ? autoComplete : "tel-national"}
        value={displayed}
        onChange={handleInput}
        onBlur={onBlur}
        placeholder={country.example}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        className={cn(
          "h-full min-w-0 flex-1 border-0 bg-transparent px-4 text-sm focus:outline-none",
          dark
            ? "text-cream placeholder:text-cream/60"
            : "text-forest placeholder:text-forest/70",
        )}
      />
    </div>
  );
}
