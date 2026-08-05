import { buttonVariants, ButtonArrow } from "@/components/ui/button";
import { cn } from "@/lib/cn";

/**
 * The cover: a full-viewport statement on a forest field that carries light.
 * Two quiet layers build the drama (owner direction, 2026-08-05): the
 * `hero-atmosphere` lagoon light breathing through the field, and filmic
 * grain over it. Entrance is first-paint choreography only — the composition surfaces
 * from depth and the facts rule draws itself in — there is still no
 * scroll-triggered motion (owner direction, 2026-08-04 stands). An animated
 * wave horizon and a corner glow were tried and removed in earlier rounds;
 * the atmosphere differs in kind — it is the field, not an ornament on it.
 *
 * The product preview lives in the next act, so the cover's only job is the
 * promise: every video is a bookable experience (owner copy, 2026-08-05).
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
      {/* The field: breathing lagoon light, then grain on top so both sit in
          the same film. A vast ghosted ensō was tried here and removed
          (owner direction, 2026-08-05) — the mark belongs in the header, not
          behind the type. All decorative, all inert. */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="hero-atmosphere" />
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

          {/*
            One flowing sentence with the three journey words turned — video,
            experience, book — instead of a block second line (owner
            direction, 2026-08-06). The highlights trace exactly what the
            product does: watch the video, it is the experience, book it.
            Each is a TRUE drawn italic (v2.5: Fraunces ships one) at the
            `font-turn` weight; the cover is the one place the brand turns
            more than once, because these three words ARE the concept.
          */}
          <h1
            className="font-display emerge tracking-display mt-10 max-w-4xl text-[clamp(2.75rem,7vw,5.25rem)] leading-[1.08] font-normal text-balance"
            style={{ animationDelay: "0.14s" }}
          >
            Every <em className="text-terra-soft font-turn italic">video</em>{" "}
            here is an{" "}
            <em className="text-terra-soft font-turn italic">experience</em> you
            can actually{" "}
            <em className="text-terra-soft font-turn italic">book.</em>
          </h1>

          <p
            className="text-cream/70 emerge mt-9 max-w-2xl text-lg leading-relaxed"
            style={{ animationDelay: "0.28s" }}
          >
            Every video is filmed by the people behind the experience, so what
            you watch is exactly what you&rsquo;ll get. Discover the Andaman
            Islands through real moments, not advertisements.
          </p>

          <div
            className="emerge mt-11 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row"
            style={{ animationDelay: "0.4s" }}
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
                buttonVariants({ variant: "paper", size: "lg" }),
                "w-full sm:w-auto",
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

        {/* The momentum line: three true facts, and the three islands. Its
            rule draws itself in as the row arrives. */}
        <div
          className="emerge relative mt-16 flex flex-col items-center gap-4 pt-6 text-center sm:mt-20 sm:flex-row sm:justify-between sm:gap-x-10 sm:text-left"
          style={{ animationDelay: "0.52s" }}
        >
          <span
            aria-hidden
            className="draw-line bg-cream/12 absolute inset-x-0 top-0 h-px"
            style={{ animationDelay: "0.72s" }}
          />
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
