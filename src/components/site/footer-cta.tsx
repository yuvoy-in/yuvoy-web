"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonVariants, ButtonArrow } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { endsWithLeadForm, PRIMARY_CTA } from "@/lib/site/nav";

/**
 * The footer's closing call to action.
 *
 * Hidden on routes that already end in the registration form — asking again
 * immediately below the form reads as a page that has lost track of what it
 * just asked for.
 */
export function FooterCta() {
  const pathname = usePathname();
  if (endsWithLeadForm(pathname)) return null;

  return (
    <div className="container-page border-cream/12 border-b py-20 sm:py-24">
      <p className="eyebrow text-terra-soft">Experience more.</p>
      <h2 className="font-display mt-6 max-w-3xl text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-5xl">
        The islands first.{" "}
        <em className="text-terra-soft font-bold not-italic">
          Then everywhere worth going.
        </em>
      </h2>
      <p className="text-cream/70 mt-6 max-w-xl text-lg">
        Join the waitlist and we&rsquo;ll message you when the first Andaman
        experiences are ready.
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
