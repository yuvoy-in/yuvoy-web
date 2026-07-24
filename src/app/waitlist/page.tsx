"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Wordmark } from "@/components/brand/wordmark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  name: z.string().trim().max(80).optional(),
  email: z
    .string()
    .min(1, "Email is required.")
    .email("Enter a valid email address."),
});

type FormValues = z.infer<typeof formSchema>;

export default function WaitlistPage() {
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

  return (
    <main className="flex min-h-dvh flex-col">
      <header className="px-6 py-6 sm:px-10">
        <Link href="/" aria-label="Yuvoy home">
          <Wordmark />
        </Link>
      </header>

      <section className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 pb-16">
        {joined ? (
          <div className="text-center">
            <p className="label text-terra">You&rsquo;re on the list</p>
            <h1 className="font-display text-forest mt-5 text-4xl leading-tight">
              We&rsquo;ll be in touch.
            </h1>
            <p className="text-forest/70 mt-4">
              Early access opens ahead of our October 2026 season. Until then —
              don&rsquo;t be a tourist.
            </p>
            <Link
              href="/"
              className="label text-forest/55 hover:text-forest mt-8 inline-block transition-colors"
            >
              ← Back home
            </Link>
          </div>
        ) : (
          <>
            <p className="label text-terra">Season One · Andaman Islands</p>
            <h1 className="font-display text-forest mt-5 text-4xl leading-tight">
              Join the waitlist.
            </h1>
            <p className="text-forest/70 mt-4">
              Be first to book immersive experiences when they open. No noise —
              just an early word before everyone else.
            </p>

            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="mt-8 flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1.5">
                <Input
                  {...register("name")}
                  placeholder="Name (optional)"
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
                {isSubmitting ? "Joining…" : "Join the waitlist"}
              </Button>

              {submitFailed && (
                <p role="alert" className="text-terra-deep text-center text-sm">
                  Something went wrong. Please try again.
                </p>
              )}
            </form>
          </>
        )}
      </section>
    </main>
  );
}
