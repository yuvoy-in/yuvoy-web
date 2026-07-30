"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { WaitlistAudience } from "@/lib/waitlist/audience";

const formSchema = z.object({
  name: z.string().trim().max(80).optional(),
  email: z
    .string()
    .min(1, "Email is required.")
    .email("Enter a valid email address."),
});

type FormValues = z.infer<typeof formSchema>;

/** Audience-specific copy. Everything else about the form is shared. */
const COPY = {
  traveller: {
    eyebrow: "Season One · Andaman Islands",
    heading: "Join the waitlist.",
    body: "Be first to hear when immersive experiences open. No noise — just an early word before everyone else.",
    namePlaceholder: "Name (optional)",
    submit: "Join the waitlist",
    submitting: "Joining…",
    doneEyebrow: "You’re on the list",
    doneBody:
      "We’ll be in touch ahead of the season. Until then — don’t be a tourist.",
  },
  provider: {
    eyebrow: "For experience providers",
    heading: "Onboard with Yuvoy.",
    body: "If you run experiences in the Andamans — on the water, across the islands or after dark — tell us about yourself and we’ll come to you.",
    namePlaceholder: "Your name or business (optional)",
    submit: "Register interest",
    submitting: "Sending…",
    doneEyebrow: "Thanks — we have it",
    doneBody:
      "A member of the team will follow up to talk through what you offer.",
  },
} as const satisfies Record<WaitlistAudience, unknown>;

export function WaitlistForm({ audience }: { audience: WaitlistAudience }) {
  const copy = COPY[audience];
  const [submitFailed, setSubmitFailed] = useState(false);
  const [joined, setJoined] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(formSchema) });

  async function onSubmit(values: FormValues) {
    setSubmitFailed(false);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("request_failed");
      setJoined(true);
    } catch {
      setSubmitFailed(true);
    }
  }

  if (joined) {
    return (
      <div className="text-center">
        <p className="label text-terra">{copy.doneEyebrow}</p>
        <h1 className="font-display text-forest mt-5 text-4xl leading-tight">
          We&rsquo;ll be in touch.
        </h1>
        <p className="text-forest/70 mt-4">{copy.doneBody}</p>
        <Link
          href="/"
          className="label text-forest/55 hover:text-forest mt-8 inline-block transition-colors"
        >
          ← Back home
        </Link>
      </div>
    );
  }

  return (
    <>
      <p className="label text-terra">{copy.eyebrow}</p>
      <h1 className="font-display text-forest mt-5 text-4xl leading-tight">
        {copy.heading}
      </h1>
      <p className="text-forest/70 mt-4">{copy.body}</p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="mt-8 flex flex-col gap-4"
      >
        <div className="flex flex-col gap-1.5">
          <Input
            {...register("name")}
            placeholder={copy.namePlaceholder}
            autoComplete="name"
            aria-invalid={!!errors.name}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Input
            {...register("email")}
            type="email"
            inputMode="email"
            placeholder="you@email.com"
            autoComplete="email"
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p role="alert" className="text-terra-deep px-5 text-sm">
              {errors.email.message}
            </p>
          )}
        </div>

        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? copy.submitting : copy.submit}
        </Button>

        {submitFailed && (
          <p role="alert" className="text-terra-deep text-center text-sm">
            Something went wrong. Please try again.
          </p>
        )}
      </form>
    </>
  );
}
