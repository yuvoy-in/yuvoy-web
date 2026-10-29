"use client";

import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input, inputVariants } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import {
  submitEvent,
  type Receipt,
  type VocabularyTerm,
} from "@/lib/submit/api";
import {
  LONGEST_RUN,
  addDays,
  isDay,
  startBounds,
  todayIn,
} from "@/lib/submit/local-day";
import type { PlaceOption } from "@/lib/submit/places";
import {
  LIMITS,
  submissionSchema,
  toSubmissionBody,
  type SubmissionField,
  type SubmissionFormValues,
} from "@/lib/submit/schema";
import { WORDS } from "@/lib/submit/words";
import { FieldError } from "./field-error";
import { TrapField } from "./trap-field";

/**
 * The fields in the order they are shown. A refusal from the API moves focus
 * to the first of these it names, as a refusal caught here does.
 */
const FIELD_ORDER: SubmissionField[] = [
  "title",
  "department",
  "destinationKey",
  "venue",
  "address",
  "startsOn",
  "startTime",
  "endsOn",
  "endTime",
  "isFree",
  "priceFrom",
  "priceTo",
  "officialUrl",
  "summary",
  "organiserName",
  "email",
  "consent",
];

const L = WORDS.labels;

/**
 * The event form, step one of `/submit`.
 *
 * Checks every rule the API checks before it sends (`checkSubmission`), so an
 * organiser meets a refusal against the field, in the API's own words, without
 * a round trip. The API checks the same again and answers `400` with
 * `details` keyed by field; those land on the same inputs, plus the two it
 * alone can make (a link on a blocked host, a place not open).
 *
 * Every failure keeps every field. Only the outcomes that leave this step go
 * up to `SubmitFlow`, with the values as typed, so the code step's "Back to
 * the form" and a stale release can both hand them back.
 */
export function SubmitForm({
  places,
  categories,
  initial,
  online,
  onSent,
  onClosed,
}: {
  places: PlaceOption[];
  categories: VocabularyTerm[];
  initial: SubmissionFormValues;
  online: boolean;
  onSent: (receipt: Receipt, values: SubmissionFormValues) => void;
  onClosed: (values: SubmissionFormValues) => void;
}) {
  /*
    "Today" is the chosen place's, in its market's zone. Before a place is
    chosen it is the first place's (both discover markets are Asia/Kolkata
    today); the check runs again on submit against whatever was chosen.
  */
  const zoneFor = React.useCallback(
    (key: string) =>
      places.find((place) => place.key === key)?.timezone ?? places[0].timezone,
    [places],
  );

  const resolver = React.useMemo(
    () => zodResolver(submissionSchema((key) => todayIn(zoneFor(key)))),
    [zoneFor],
  );

  const {
    register,
    control,
    handleSubmit,
    setError,
    setFocus,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<SubmissionFormValues>({ resolver, defaultValues: initial });

  // `useWatch`, not `watch()`, for the reason `message-form.tsx` gives.
  const destinationKey = useWatch({ control, name: "destinationKey" });
  const isFree = useWatch({ control, name: "isFree" });
  const startsOn = useWatch({ control, name: "startsOn" });
  const dates = startBounds(todayIn(zoneFor(destinationKey ?? "")));
  // The end date's picker follows the start: on it or up to 30 days after.
  const ends = isDay(startsOn ?? "")
    ? { min: startsOn, max: addDays(startsOn, LONGEST_RUN) }
    : { min: dates.min, max: addDays(dates.max, LONGEST_RUN) };

  /** A sentence for the whole form: what has no field to sit against. */
  const [notice, setNotice] = React.useState<string | null>(null);
  /** Seconds the API asked us to wait (`Retry-After`), point 13 A. */
  const [blockedFor, setBlockedFor] = React.useState<number | null>(null);
  /** One tap is one request, however fast the second tap lands. */
  const inFlight = React.useRef(false);

  React.useEffect(() => {
    if (blockedFor === null) return;
    const timer = setTimeout(() => setBlockedFor(null), blockedFor * 1000);
    return () => clearTimeout(timer);
  }, [blockedFor]);

  async function onSubmit(values: SubmissionFormValues) {
    if (inFlight.current) return;
    inFlight.current = true;
    setNotice(null);
    const res = await submitEvent(toSubmissionBody(values));
    inFlight.current = false;

    switch (res.kind) {
      case "sent":
        onSent(res.receipt, getValues());
        return;
      case "closed":
        onClosed(getValues());
        return;
      case "invalid": {
        /*
          Each sentence against the field it names. A key with no input on
          screen (a price while Free is chosen, or a field this form does
          not have) goes in the notice instead, so a refusal is never
          attached to nothing.
        */
        const shown = new Set<string>(FIELD_ORDER);
        if (getValues("isFree") !== "paid") {
          shown.delete("priceFrom");
          shown.delete("priceTo");
        }
        const loose: string[] = [];
        let first: SubmissionField | undefined;
        for (const field of FIELD_ORDER) {
          const message = res.fields[field];
          if (!message || !shown.has(field)) continue;
          setError(field, { type: "server", message });
          first ??= field;
        }
        for (const [field, message] of Object.entries(res.fields)) {
          if (!shown.has(field)) loose.push(message);
        }
        if (loose.length > 0) setNotice(loose.join(" "));
        else if (!first) setNotice(res.message ?? WORDS.failed);
        if (first) setFocus(first);
        return;
      }
      case "throttled":
        setNotice(res.message || WORDS.failed);
        if (res.retryAfter) setBlockedFor(res.retryAfter);
        return;
      case "paused":
        setNotice(res.message);
        return;
      case "offline":
        // The offline line below says it, from the browser's own state.
        return;
      case "failed":
        setNotice(res.message ?? WORDS.failed);
        return;
    }
  }

  const err = (field: SubmissionField) => errors[field]?.message;
  const describe = (field: SubmissionField, help?: boolean) =>
    ({
      "aria-invalid": !!errors[field],
      "aria-describedby":
        [
          help ? `submit-${field}-help` : null,
          errors[field] ? `submit-${field}-error` : null,
        ]
          .filter(Boolean)
          .join(" ") || undefined,
    }) as const;

  const selectClass = inputVariants({ tone: "onLight" });
  const textareaClass = cn(inputVariants({ tone: "onLight" }), "h-auto py-3");

  return (
    <form
      // Inside a handler, not at render: `onSubmit` reads the in-flight ref.
      onSubmit={(event) => void handleSubmit(onSubmit)(event)}
      noValidate
      aria-busy={isSubmitting}
      className="relative mt-8 flex flex-col gap-6"
    >
      <p className="text-forest/75 leading-relaxed">{WORDS.intro}</p>

      <Field name="title" label={L.title} error={err("title")}>
        <Input
          id="submit-title"
          {...register("title")}
          {...describe("title")}
        />
      </Field>

      <Field name="department" label={L.department} error={err("department")}>
        <select
          id="submit-department"
          className={selectClass}
          {...register("department")}
          {...describe("department")}
        >
          <option value="">{L.choose}</option>
          {categories.map((term) => (
            <option key={term.key} value={term.key}>
              {term.label}
            </option>
          ))}
        </select>
      </Field>

      <Field
        name="destinationKey"
        label={L.destinationKey}
        error={err("destinationKey")}
      >
        <select
          id="submit-destinationKey"
          className={selectClass}
          {...register("destinationKey")}
          {...describe("destinationKey")}
        >
          <option value="">{L.choose}</option>
          {places.map((place) => (
            <option key={place.key} value={place.key}>
              {place.label}
            </option>
          ))}
        </select>
      </Field>

      <Field name="venue" label={L.venue} error={err("venue")}>
        <Input
          id="submit-venue"
          {...register("venue")}
          {...describe("venue")}
        />
      </Field>

      <Field name="address" label={L.address} error={err("address")}>
        <Input
          id="submit-address"
          maxLength={LIMITS.address}
          autoComplete="street-address"
          {...register("address")}
          {...describe("address")}
        />
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field name="startsOn" label={L.startsOn} error={err("startsOn")}>
          <Input
            id="submit-startsOn"
            type="date"
            min={dates.min}
            max={dates.max}
            {...register("startsOn")}
            {...describe("startsOn")}
          />
        </Field>
        <Field name="startTime" label={L.startTime} error={err("startTime")}>
          <Input
            id="submit-startTime"
            type="time"
            {...register("startTime")}
            {...describe("startTime")}
          />
        </Field>
        <Field name="endsOn" label={L.endsOn} error={err("endsOn")}>
          <Input
            id="submit-endsOn"
            type="date"
            min={ends.min}
            max={ends.max}
            {...register("endsOn")}
            {...describe("endsOn")}
          />
        </Field>
        <Field name="endTime" label={L.endTime} error={err("endTime")}>
          <Input
            id="submit-endTime"
            type="time"
            {...register("endTime")}
            {...describe("endTime")}
          />
        </Field>
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="label text-forest/75">{L.price}</legend>
        <div className="mt-1.5 flex gap-6">
          {(["free", "paid"] as const).map((option) => (
            <label
              key={option}
              className="text-forest flex min-h-6 items-center gap-2.5"
            >
              <input
                type="radio"
                value={option}
                className="accent-terra-deep size-4"
                {...register("isFree")}
                {...describe("isFree")}
              />
              {option === "free" ? L.free : L.paid}
            </label>
          ))}
        </div>
        <FieldError id="submit-isFree-error" message={err("isFree")} />
      </fieldset>

      {isFree === "paid" && (
        <div className="grid gap-6 sm:grid-cols-2">
          <Field name="priceFrom" label={L.priceFrom} error={err("priceFrom")}>
            <Input
              id="submit-priceFrom"
              inputMode="numeric"
              autoComplete="off"
              {...register("priceFrom")}
              {...describe("priceFrom")}
            />
          </Field>
          <Field name="priceTo" label={L.priceTo} error={err("priceTo")}>
            <Input
              id="submit-priceTo"
              inputMode="numeric"
              autoComplete="off"
              {...register("priceTo")}
              {...describe("priceTo")}
            />
          </Field>
        </div>
      )}

      <Field
        name="officialUrl"
        label={L.officialUrl}
        help={WORDS.help.officialUrl}
        error={err("officialUrl")}
      >
        <Input
          id="submit-officialUrl"
          type="url"
          inputMode="url"
          maxLength={LIMITS.officialUrl}
          {...register("officialUrl")}
          {...describe("officialUrl", true)}
        />
      </Field>

      <Field name="summary" label={L.summary} error={err("summary")}>
        <textarea
          id="submit-summary"
          rows={3}
          maxLength={LIMITS.summary}
          className={textareaClass}
          {...register("summary")}
          {...describe("summary")}
        />
      </Field>

      <Field
        name="organiserName"
        label={L.organiserName}
        error={err("organiserName")}
      >
        <Input
          id="submit-organiserName"
          autoComplete="organization"
          {...register("organiserName")}
          {...describe("organiserName")}
        />
      </Field>

      <Field
        name="email"
        label={L.email}
        help={WORDS.help.email}
        error={err("email")}
      >
        <Input
          id="submit-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          maxLength={LIMITS.email}
          {...register("email")}
          {...describe("email", true)}
        />
      </Field>

      <div className="flex flex-col gap-1.5">
        <label className="text-forest flex items-start gap-3 text-sm leading-relaxed">
          <input
            id="submit-consent"
            type="checkbox"
            className="accent-terra-deep mt-0.5 size-4 shrink-0"
            {...register("consent")}
            {...describe("consent")}
          />
          <span>{L.consent}</span>
        </label>
        <FieldError id="submit-consent-error" message={err("consent")} />
      </div>

      <TrapField registration={register("extra")} />

      {notice && (
        <p
          role="alert"
          className="border-terra-deep/40 rounded-edge text-forest border p-4 text-sm leading-relaxed"
        >
          {notice}
        </p>
      )}

      {!online && (
        <p role="status" className="text-forest/75 text-sm">
          {WORDS.offline}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        className="self-start"
        disabled={isSubmitting || !online || blockedFor !== null}
      >
        {WORDS.send}
      </Button>
    </form>
  );
}

/** A label, its input, an optional help line and the field's error. */
function Field({
  name,
  label,
  help,
  error,
  children,
}: {
  name: SubmissionField;
  label: string;
  help?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={`submit-${name}`} className="label text-forest/75">
        {label}
      </label>
      {children}
      {help && (
        <p id={`submit-${name}-help`} className="text-forest/75 text-sm">
          {help}
        </p>
      )}
      <FieldError id={`submit-${name}-error`} message={error} />
    </div>
  );
}
