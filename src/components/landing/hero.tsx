import { buttonVariants, ButtonArrow } from "@/components/ui/button";
import { cn } from "@/lib/cn";

/**
 * The cover: a full-viewport statement on a flat forest field, textured only
 * by filmic grain. The scene is still; the only motion is the composition
 * surfacing from depth once, on first paint (the `emerge` utility). An
 * animated wave horizon and a terracotta corner glow were both tried and
 * removed (owner direction, 2026-08-03 and 2026-08-04); the type carries the
 * register on its own.
 *
 * The product preview lives in the next act, so the cover's only job is the
 * question.
 *
 * The facts row along the bottom is the page's momentum line and every entry
 * on it must be literally true today. "3 founding operators signed" is a real
 * count confirmed by the owner (2026-08-03); update it only to another true
 * number.
 */
const FACTS = [
  "Waitlist open",
  "No payment required",
  "3 founding operators signed",
];

export function Hero() {
  return (
    /*
      `-mt-14` pulls the cover up behind the header's own 56px of flow, and the
      inner `pt-14` puts the content back exactly where it was. Without this a
      transparent header would show the page background above the cover, not
      the cover itself. `data-dark-hero` is how the header knows this page has
      one.
    */
    <section
      data-dark-hero
      className="bg-forest text-cream relative -mt-14 overflow-hidden"
    >
      {/* Nothing but grain: a flat forest field, so the type is the whole
          composition. The terracotta corner glow that used to sit here went
          with the waves (owner direction, 2026-08-04). */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="grain" />
      </div>

      {/* Top padding is the header (3.5rem) plus the section's own, so the
          composition lands exactly where it did before the cover was pulled
          up behind the bar. */}
      <div className="container-page relative flex min-h-dvh flex-col justify-center pt-30 pb-16 sm:pt-34 sm:pb-20">
        <div className="flex flex-col items-center text-center">
          {/* Plain `label`, not `eyebrow`: the cover line carries no marker
              (owner direction, 2026-08-05). */}
          <p
            className="label text-terra-soft emerge"
            style={{ animationDelay: "0.05s" }}
          >
            Andaman Islands · Opening soon
          </p>

          <h1
            className="font-display emerge mt-9 max-w-4xl text-[clamp(3rem,8.5vw,6rem)] leading-[0.98] font-normal tracking-tight text-balance"
            style={{ animationDelay: "0.14s" }}
          >
            Every trip starts with one question.
            <span className="text-terra-soft mt-3 block italic">
              &ldquo;What should I do?&rdquo;
            </span>
          </h1>

          <p
            className="text-cream/70 emerge mt-9 max-w-2xl text-lg leading-relaxed"
            style={{ animationDelay: "0.26s" }}
          >
            Yuvoy answers it. Everything a place actually offers, on honest
            video from the people who run it, booked in the same scroll.
          </p>

          <div
            className="emerge mt-11 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row"
            style={{ animationDelay: "0.38s" }}
          >
            {/*
              Native anchors, not next/link: hash-only hrefs pushed through
              the router use history.pushState, which never fires the
              hashchange event LeadForms listens on. A plain anchor sets
              location.hash natively, which both scrolls and fires it.
            */}
            <a
              href="#register"
              className={cn(
                buttonVariants({ size: "lg" }),
                "focus-visible:ring-offset-forest w-full sm:w-auto",
              )}
            >
              Join the waitlist
              <ButtonArrow />
            </a>
            <a
              href="#how"
              className={cn(
                buttonVariants({ variant: "outlineOnDark", size: "lg" }),
                "focus-visible:ring-offset-forest w-full sm:w-auto",
              )}
            >
              How it works
            </a>
          </div>
        </div>

        {/* The momentum line: three true facts, and the three islands. */}
        <div
          className="emerge border-cream/12 mt-16 flex flex-col items-center gap-4 border-t pt-6 text-center sm:mt-20 sm:flex-row sm:justify-between sm:gap-x-10 sm:text-left"
          style={{ animationDelay: "0.5s" }}
        >
          <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 sm:justify-start">
            {FACTS.map((fact) => (
              <li
                key={fact}
                className="label text-cream/70 flex items-center gap-2.5"
              >
                <span aria-hidden className="bg-terra size-1 shrink-0" />
                {fact}
              </li>
            ))}
          </ul>
          <p className="label text-cream/70">Havelock · Neil · Port Blair</p>
        </div>
      </div>
    </section>
  );
}
