"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonVariants, ButtonArrow } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { showsFooterCta, PRIMARY_CTA, WAITLIST_CTA } from "@/lib/site/nav";
import { appHref } from "@/lib/site/product-links";

/**
 * The footer's closing call to action.
 *
 * Shown on the two kinds of page where the ask is earned — a destination page
 * and a journal post — and nowhere else. The header carries "Join Waitlist"
 * everywhere, so repeating it at the foot of every route was pressure rather
 * than invitation; `showsFooterCta` holds the reasoning and the list.
 *
 * The headline used to be "The islands first. Then everywhere worth going."
 * It was replaced on 2026-08-06: "everywhere worth going" is an expansion
 * claim nobody has agreed, and the defensive register it belonged to made a
 * first launch sound like a position being held rather than a beginning. What
 * is here now is the true thing, which is also the more confident one.
 */
export function FooterCta() {
  const pathname = usePathname();
  if (!showsFooterCta(pathname)) return null;

  return (
    <div className="container-page border-cream/12 border-b py-14 sm:py-24">
      <p className="eyebrow text-terra-soft">Early access</p>
      <h2 className="font-display tracking-display mt-4 max-w-3xl text-4xl leading-[1.05] font-normal text-balance sm:mt-6 sm:text-5xl">
        Be first to{" "}
        <em className="text-terra-soft font-turn italic">experience Yuvoy.</em>
      </h2>
      <p className="text-cream/70 mt-5 max-w-xl leading-relaxed sm:mt-6 sm:text-lg">
        Real experiences from the people who run them, in Havelock, Neil and
        Port Blair. Booking opens as operators come on.
      </p>
      {/* An <a>: this leaves the origin (yuvoy-web#154). */}
      <a
        href={appHref("footer")}
        className={cn(
          buttonVariants({ variant: "paper", size: "lg" }),
          "mt-8 flex w-full sm:mt-10 sm:inline-flex sm:w-auto",
        )}
      >
        {PRIMARY_CTA.label}
        <ButtonArrow />
      </a>

      {/*
        The waitlist survives as the secondary path (owner's call, 9 Sep 2026).
        It is still the only way to hear about a destination the first season
        does not cover, so it keeps a door here rather than being retired with
        the leads it would have collected.
      */}
      <p className="text-cream/70 mt-6 text-sm">
        Somewhere else in mind?{" "}
        <Link
          href={WAITLIST_CTA.href}
          className="text-cream underline underline-offset-4"
        >
          Tell us where you want to go
        </Link>
        .
      </p>
    </div>
  );
}
