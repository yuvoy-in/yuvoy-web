"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonVariants, ButtonArrow } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { suppressesFooterCta, PRIMARY_CTA } from "@/lib/site/nav";

/**
 * The footer's closing call to action.
 *
 * Hidden on routes that already close with the ask — the form itself, or a
 * section that just made the same request. Repeating it immediately below
 * reads as a page that has lost track of what it just said.
 *
 * The headline used to be "The islands first. Then everywhere worth going."
 * It was replaced on 2026-08-06: "everywhere worth going" is an expansion
 * claim nobody has agreed, and the defensive register it belonged to made a
 * first launch sound like a position being held rather than a beginning. What
 * is here now is the true thing, which is also the more confident one.
 */
export function FooterCta() {
  const pathname = usePathname();
  if (suppressesFooterCta(pathname)) return null;

  return (
    <div className="container-page border-cream/12 border-b py-20 sm:py-24">
      <p className="eyebrow text-terra-soft">Early access</p>
      <h2 className="font-display tracking-display mt-6 max-w-3xl text-4xl leading-[1.05] font-normal text-balance sm:text-5xl">
        Be first to{" "}
        <em className="text-terra-soft font-turn italic">experience Yuvoy.</em>
      </h2>
      <p className="text-cream/70 mt-6 max-w-xl text-lg leading-relaxed">
        Join the waitlist and we will contact you when the first experiences for
        your destination are ready.
      </p>
      <Link
        href={PRIMARY_CTA.href}
        className={cn(
          buttonVariants({ variant: "paper", size: "lg" }),
          "mt-10 flex w-full sm:inline-flex sm:w-auto",
        )}
      >
        {PRIMARY_CTA.label}
        <ButtonArrow />
      </Link>
    </div>
  );
}
