"use client";

import * as React from "react";
import Image from "next/image";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckRing, PlaneOrnament } from "@/components/site/contact-icons";
import { isPlausibleEmail } from "@/lib/contact/email";
import { sendMessage, type SendResult } from "@/lib/messages/api";
import { CONTACT_EMAIL, CONTACT_TOPICS, MESSAGE_MAX } from "@/lib/site/contact";
import type { components } from "@/lib/api/schema";

type MessageTopic = components["schemas"]["MessageTopic"];

/**
 * The message form's rules, which are the endpoint's rules.
 *
 * `topic` is validated against the same slugs the API accepts rather than
 * `z.string()`: a renamed option that reached the network would come back a
 * 400 the visitor cannot act on, and the enum makes that a build error here
 * instead.
 *
 * `message` is capped at 4000 **characters, not bytes** (yuvoy-in/yuvoy-api#5)
 * — 4000 multi-byte characters is still 4000 characters, so a message written
 * in Hindi is not silently penalised. `String.length` counts UTF-16 code
 * units, which is what the API counts too.
 *
 * Email uses `isPlausibleEmail`, not Zod's `.email()`, for the reason given in
 * `lead-forms.tsx`: every rule beyond "could not be delivered under any
 * reading" is another way to refuse somebody's real address.
 */
const TOPIC_VALUES = CONTACT_TOPICS.map((topic) => topic.value) as [
  MessageTopic,
  ...MessageTopic[],
];

const messageSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter your name.")
    .max(120, "Name must be 120 characters or fewer."),
  email: z
    .string()
    .trim()
    .min(1, "Enter your email address.")
    .max(254, "That email address is too long.")
    .refine(isPlausibleEmail, "Enter a valid email address."),
  topic: z.enum(TOPIC_VALUES),
  message: z
    .string()
    .trim()
    .min(1, "Write your message.")
    .max(MESSAGE_MAX, `Keep it to ${MESSAGE_MAX.toLocaleString()} characters.`),
  website: z.string().max(255).optional(), // honeypot
});

type MessageValues = z.infer<typeof messageSchema>;

/**
 * "Leave a note" — the message form, live as of 2026-08-07.
 *
 * ## What it is not
 *
 * **It is not a lead**, and nothing here treats it as one. There is no
 * marketing consent to give, because the endpoint has no column to store it in
 * — the absence is the guarantee that the Privacy page's "used to answer you,
 * and nothing else" stays structurally true rather than a promise. There is no
 * deduplication either: two questions from one address are two questions.
 *
 * ## What it says when it works
 *
 * "Received", never "we will reply by…". The site publishes no response time
 * (see `@/lib/site/contact`), the API answers `202` rather than `201` for the
 * same reason, and a confirmation that invented one would be the one promise
 * on this page nobody agreed to keep.
 *
 * ## Every outcome has a state
 *
 * Recorded, invalid, rate-limited, unavailable and offline each render their
 * own truthful notice — the same set the lead forms carry, from the same
 * classification in `@/lib/messages/api`. The live channels stay on screen in
 * every failure state, because a person with a question should never be left
 * with only a broken form.
 *
 * It replaced a complete-but-`disabled` version that shipped behind a "Coming
 * soon" badge while `POST /v1/messages` did not exist. The markup was written
 * to make this change mechanical, and it was.
 */
export function MessageForm() {
  const [result, setResult] = React.useState<SendResult | null>(null);
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<MessageValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: { topic: CONTACT_TOPICS[0].value as MessageTopic },
  });

  /*
    `useWatch`, not the form's `watch()`. Both read the same value; only this
    one subscribes to a single field rather than handing back a function whose
    identity changes every render. Not style: React Compiler refuses to memoize
    any component that calls `watch()`, so the form and everything under it
    would re-render on every keystroke — for a counter that depends on one
    field. Same reasoning as `ContactFields` in `lead-forms.tsx`.
  */
  const typed = useWatch({ control, name: "message" }) ?? "";

  async function onSubmit(values: MessageValues) {
    const res = await sendMessage({
      name: values.name,
      email: values.email,
      topic: values.topic,
      message: values.message,
      // Omitted rather than sent empty: an optional field's absence is an
      // absence, and an empty string is a value.
      website: values.website || undefined,
    });

    if (res.kind === "invalid") {
      /*
        Server-side rejections map back onto the fields that exist. Anything
        naming a field this form does not render would otherwise attach an
        error to nothing, and the visitor would see the button do nothing at
        all — the worst failure a form has, because it reads as a bug in their
        browser. Those are raised into the notice above instead.
      */
      for (const [field, message] of Object.entries(res.fields)) {
        if (field in values) {
          setError(field as keyof MessageValues, { message });
        }
      }
    }
    setResult(res);
  }

  if (result?.kind === "sent") {
    return (
      <NoteCard>
        <Heading />
        <div
          role="status"
          className="border-paper/15 bg-paper/5 rounded-edge mt-8 border p-6 sm:p-7"
        >
          {/*
            A plain `label`, not the `eyebrow` utility: the eyebrow's marker is
            a terracotta square, and the ring beside it is already this block's
            marker. Two would be one too many, and the page spends its one
            eyebrow on "Contact" at the top of the act.
          */}
          <div className="flex items-start gap-5">
            <CheckRing className="text-terra-soft mt-1 size-10 flex-none" />
            <div className="min-w-0">
              <p className="label text-terra-soft">Message received</p>
              {/*
                No reply-time promise, here or anywhere. The site publishes
                none (owner direction), and the moment a confirmation invents
                one it becomes the thing the team is measured against.
              */}
              <p className="font-display tracking-display mt-4 text-2xl font-normal text-balance">
                Thanks. A person will read this.
              </p>
            </div>
          </div>

          {/* A rule, not a gap: what follows is about the data rather than
              about the message, and the two should not read as one sentence
              broken over a paragraph break. */}
          <hr className="border-paper/12 mt-7" />

          <p className="text-paper/70 mt-6 leading-relaxed">
            We have your note and your email address, and we use them to answer
            you and nothing else.
          </p>
        </div>
      </NoteCard>
    );
  }

  const failure =
    result?.kind === "rate_limited" ||
    result?.kind === "unavailable" ||
    result?.kind === "offline"
      ? result
      : null;

  return (
    <NoteCard>
      <Heading />

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="relative mt-8 flex flex-col gap-5"
      >
        {/* Visually hidden honeypot. Real visitors never see or fill it, and a
            bot that does gets the same 202 as everybody else — with no row and
            no notification written. */}
        <div
          aria-hidden
          className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
        >
          <label>
            Leave this field empty
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              {...register("website")}
            />
          </label>
        </div>

        {failure && <FailureNotice result={failure} />}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="m-name" className="label text-paper/70">
            Name
          </label>
          <Input
            tone="onDark"
            id="m-name"
            {...register("name")}
            autoComplete="name"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "m-name-error" : undefined}
          />
          <FieldError id="m-name-error" message={errors.name?.message} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="m-email" className="label text-paper/70">
            Email
          </label>
          <Input
            tone="onDark"
            id="m-email"
            {...register("email")}
            type="email"
            inputMode="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "m-email-error" : undefined}
          />
          <FieldError id="m-email-error" message={errors.email?.message} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="m-topic" className="label text-paper/70">
            I&rsquo;m contacting about
          </label>
          <select
            id="m-topic"
            {...register("topic")}
            className="border-paper/20 bg-paper/5 text-paper focus-visible:border-terra-soft focus-visible:ring-terra-soft/40 rounded-edge h-12 w-full border px-4 text-base transition-colors duration-200 focus-visible:ring-2 focus-visible:outline-none pointer-fine:text-sm"
          >
            {CONTACT_TOPICS.map((topic) => (
              <option
                key={topic.value}
                value={topic.value}
                className="bg-paper text-forest"
              >
                {topic.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-4">
            <label htmlFor="m-message" className="label text-paper/70">
              Message
            </label>
            {/*
              The counter appears only as the cap comes into view. Shown from
              the first keystroke it reads as a target to fill; shown when it
              starts to matter it is the one piece of information that stops a
              long message being rejected after it has been written.
            */}
            {typed.length > MESSAGE_MAX - 500 && (
              <span
                aria-hidden
                className={
                  typed.length > MESSAGE_MAX
                    ? "label text-terra-soft"
                    : "label text-paper/70"
                }
              >
                {typed.length.toLocaleString()} / {MESSAGE_MAX.toLocaleString()}
              </span>
            )}
          </div>
          <textarea
            id="m-message"
            {...register("message")}
            rows={5}
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? "m-message-error" : undefined}
            className="border-paper/20 bg-paper/5 text-paper placeholder:text-paper/60 focus-visible:border-terra-soft focus-visible:ring-terra-soft/40 rounded-edge w-full resize-y border px-4 py-3 text-base transition-colors duration-200 focus-visible:ring-2 focus-visible:outline-none pointer-fine:text-sm"
          />
          <FieldError id="m-message-error" message={errors.message?.message} />
        </div>

        <Button
          type="submit"
          variant="paper"
          size="lg"
          className="self-start"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Sending…" : "Send"}
        </Button>
      </form>
    </NoteCard>
  );
}

/**
 * The surface the note is written on: glass over the page's own bay.
 *
 * ## Why the form gets a card at all
 *
 * Everything else in this act is type on a field. A form is not type — it is a
 * set of targets, and targets need an edge to sit inside or the page reads as
 * inputs floating on a photograph. The card is what makes the right half a
 * place rather than a region.
 *
 * It is glass rather than a fill (5% paper and a backdrop blur) so the field
 * still carries through it: a solid panel here would punch a hole in the
 * photograph the act is built on, and the blur is what keeps the type legible
 * over whatever part of the bay it lands on. `rounded-edge`, like every other
 * panel — the reference this was drawn from rounds its card, and the brand is
 * rectangular (DESIGN_SYSTEM §4); a soft card would be the one rounded object
 * on a page of square ones.
 *
 * ## The horizon at its foot
 *
 * The same bay as the field behind it, cropped to its waterline, masked away
 * before it reaches the fields and held down by a forest wash. It gives the
 * card depth where nothing is being typed. Two rules govern it and both are in
 * `globals.css`: it fades out across the top three fifths (`note-horizon`),
 * and the wash keeps the surface at the tone the `paper/70` body copy is
 * measured against (`note-horizon-wash`).
 *
 * It is `aria-hidden` and inert. It is also **not** `priority` — it is the
 * page's second photograph and sits below the fold of a phone, so it must
 * never compete with the field for the first paint.
 */
function NoteCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-paper/15 bg-paper/5 rounded-edge relative overflow-hidden border p-6 backdrop-blur-md sm:p-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-56 sm:h-64"
      >
        <Image
          src="/photography/contact-note.webp"
          alt=""
          fill
          // 75 is the photography quality the optimiser allows; the source is
          // already cut to this band's region (see `DETAILS` in
          // `optimise-photography.mjs`) and renders at ~544px, masked and
          // dimmed, so nothing finer would survive the wash over it.
          quality={75}
          sizes="(min-width: 1024px) 34rem, 100vw"
          // Biased right and low. The band is wider than the region on a
          // desktop and narrower on a phone, so it trims a different edge at
          // each end; this keeps the boat in frame on the narrow one and the
          // horizon off the fields on the wide one.
          className="note-horizon object-cover object-[68%_58%] opacity-60"
        />
        <div className="note-horizon-wash absolute inset-0" />
      </div>

      {/*
        The ornament, and the only drawing on the page that illustrates
        nothing: the gesture of sending, where the eye lands after the title.
        Hidden below `sm`, where the card is the full measure and the title
        needs the width more than the page needs a flourish.
      */}
      <PlaneOrnament className="text-terra-soft/55 pointer-events-none absolute top-7 right-7 hidden w-24 sm:block" />

      {/* The content rides above both decorations; neither is in flow. */}
      <div className="relative">{children}</div>
    </div>
  );
}

function Heading() {
  return (
    /*
      `sm:pr-28` is the plane's width (96px) plus a gap, applied at exactly the
      breakpoint the plane appears at. Without it the sub-line runs under the
      ornament on a tablet — the one width where the card is wide enough to
      reach it and the type is not yet narrow enough to stop short.
    */
    <div className="sm:pr-28">
      <h2
        id="message-heading"
        className="font-display tracking-display text-[clamp(1.75rem,3.5vw,2.25rem)] leading-tight font-normal"
      >
        Leave a note
      </h2>
      {/*
        Not "we'll get back to you soon", which the reference says here. Even
        without a number that is a reply commitment, and this page makes none
        (see `@/lib/site/contact`). What it can say is where the note goes,
        which is the thing somebody hovering over a form actually wants to
        know.
      */}
      <p className="text-paper/70 mt-3 text-sm leading-relaxed">
        It reaches the team directly.
      </p>
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

/**
 * The failure states, each said plainly, each naming what happened to the
 * message — because "did it send?" is the only question the visitor has.
 *
 * Every one of them offers the email address as well. A form that cannot send
 * must not be the end of the road for somebody with a question, and that
 * address is read by a person today.
 */
function FailureNotice({
  result,
}: {
  result: Extract<
    SendResult,
    { kind: "rate_limited" | "unavailable" | "offline" }
  >;
}) {
  const copy = {
    rate_limited: {
      title: "Too many attempts just now.",
      body: "Give it a minute and try again; your message wasn’t sent yet.",
    },
    unavailable: {
      title: "We couldn’t send that.",
      body: "Something on our side isn’t answering. Nothing was sent, so please try again shortly.",
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
      <p className="text-paper/70 mt-3 text-sm">
        Or email us at{" "}
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="text-paper underline underline-offset-2"
        >
          {CONTACT_EMAIL}
        </a>
        .
      </p>
    </div>
  );
}
