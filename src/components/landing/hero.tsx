import Link from "next/link";
import { buttonVariants, ButtonArrow } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { LAUNCH_MARKET } from "@/lib/leads/registry";

/**
 * The homepage hero.
 *
 * Type-led by necessity and by design — there is no rights-cleared photography
 * or video yet, and the project's rules forbid standing in stock imagery or
 * simulated product screens. The palette, Poppins' mass and the terracotta
 * turn carry the register instead. Nothing here is simulated.
 *
 * Copy is the owner-approved canon from issue #27 and is quoted verbatim.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Ambient warmth — a soft terracotta dawn over the cream canvas. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="from-terra/18 via-terra/5 absolute -top-40 left-1/2 h-[70vh] w-[140vw] -translate-x-1/2 rounded-b-[100%] bg-linear-to-b to-transparent blur-3xl" />
      </div>

      <div className="container-page flex min-h-[calc(100dvh-4rem)] flex-col justify-center py-20 sm:py-24">
        <p
          className="eyebrow rise text-terra-deep"
          style={{ animationDelay: "0.05s" }}
        >
          Opening first in the Andaman Islands
        </p>

        {/*
          Each sentence gets its own line. Left to wrap naturally the accent
          orphaned "Feel" at the end of line one on desktop, which broke the
          phrase in the wrong place — the terracotta turn has to land on a
          whole thought.
        */}
        <h1
          className="font-display rise mt-8 max-w-5xl text-[clamp(2.25rem,6.5vw,4.5rem)] leading-[1.03] font-extrabold tracking-tight"
          style={{ animationDelay: "0.15s" }}
        >
          <span className="block">See the experience.</span>
          <span className="text-terra block italic">
            Feel if it&rsquo;s right.
          </span>
          <span className="block">Then book.</span>
        </h1>

        <div className="mt-12 flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <p
            className="rise text-teal/75 max-w-xl text-lg leading-relaxed"
            style={{ animationDelay: "0.3s" }}
          >
            Yuvoy brings local dives, boat days, food and culture to life
            through honest video from the people who run them. Join the waitlist
            for first access in Havelock, Neil and Port Blair.
          </p>

          <div
            className="rise flex w-full flex-col gap-3 sm:w-auto sm:flex-row lg:shrink-0"
            style={{ animationDelay: "0.45s" }}
          >
            <Link
              href="/waitlist"
              className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
            >
              Join the traveller waitlist
              <ButtonArrow />
            </Link>
            <Link
              href="/waitlist?audience=provider"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "w-full sm:w-auto",
              )}
            >
              Apply as a founding operator
            </Link>
          </div>
        </div>

        {/* The three launch destinations, named once, close to the promise. */}
        <div
          className="rise border-cream-line mt-16 border-t pt-6"
          style={{ animationDelay: "0.6s" }}
        >
          <p className="label text-teal/75">
            {LAUNCH_MARKET.destinations.map((d) => d.label).join(" · ")}
          </p>
        </div>
      </div>
    </section>
  );
}
