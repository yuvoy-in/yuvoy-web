import Image from "next/image";
import { buttonVariants, ButtonArrow } from "@/components/ui/button";
import { cn } from "@/lib/cn";

/**
 * The cover: a full-viewport statement on a forest field that carries light
 * — and, since 2026-08-06, a place.
 *
 * The owner-supplied island seascape is merged into the field through a
 * multiply wash and a scrim, so the brand green stays the ground and the
 * artwork reads as depth within it, warmest along the horizon where its low
 * sun echoes the terracotta. The `hero-atmosphere` lagoon light breathes
 * over it and filmic grain seats every layer in the same film. Entrance is
 * first-paint choreography only — the composition surfaces from depth and
 * the facts rule draws itself in — and there is still no scroll-triggered
 * motion (owner direction, 2026-08-04 stands); the artwork's 38s drift is
 * ambient, like the light, not an event.
 *
 * The artwork ships as a 32KB WebP. The delivered 1.5MB PNG was converted
 * because the optimiser decoding it for every cold variant kept the page
 * from reaching network idle, which timed the e2e structure specs out.
 *
 * The product preview lives in the next act, so the cover's only job is the
 * promise: watch real experiences, make one yours (owner copy, 2026-08-06).
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
      `-mt-16` pulls the cover up behind the header's own 64px of flow, and the
      inner `pt-14` puts the content back exactly where it was. Without this a
      transparent header would show the page background above the cover, not
      the cover itself. `data-dark-hero` is how the header knows this page has
      one.
    */
    <section
      data-dark-hero
      className="bg-forest text-cream relative -mt-16 overflow-hidden"
    >
      {/*
        The field, in five layers (owner artwork + direction, 2026-08-06):
        the island seascape the owner supplied, drifting almost imperceptibly;
        a forest multiply wash that pulls its hues onto the brand green; the
        scrim that dissolves it into solid forest at the top and foot; the
        breathing lagoon light; and grain over everything so all of it sits
        in the same film. The artwork is merged into the field, never pasted
        onto it — at the top edge the cover still reads as the flat forest
        the transparent header expects. All decorative, all inert.
      */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <Image
          src="/assets/hero-section-bg.webp"
          alt=""
          fill
          priority
          // 75 is the photography quality the optimiser allows (next.config
          // keeps the allowlist short on purpose; 100 is the brand mark's).
          // The scrim and grain sit over this, so nothing finer would show.
          quality={75}
          sizes="100vw"
          className="hero-photo object-cover object-[center_75%]"
        />
        <div className="bg-forest/30 absolute inset-0 mix-blend-multiply" />
        <div className="hero-scrim absolute inset-0" />
        <div className="hero-atmosphere" />
        <div className="grain" />
      </div>

      {/* Top padding is the header (4rem) plus the section's own, so the
          composition lands exactly where it did before the cover was pulled
          up behind the bar. */}
      <div className="container-page relative flex min-h-dvh flex-col justify-center pt-32 pb-16 sm:pt-36 sm:pb-20">
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
            Two sentences, two lines, each landing on its own italic turn
            (owner copy, 2026-08-06). The couplet is the composition: watch,
            then make one yours — the promise in two beats, with the accent
            closing each. Real block elements rather than the previous
            `<br>` staircase, so the break is structural and each line still
            wraps naturally on a phone. Shorter copy buys scale: 88px at
            the cap on a 5xl measure — between the 80px that felt small and
            the 100px that read as too much, and near the ceiling anyway,
            since past ~90px the first line no longer holds on one line.
            Both turns are TRUE drawn italics (v2.5) at the `font-turn`
            weight.
          */}
          <h1
            className="font-display emerge tracking-display mt-9 max-w-5xl text-[clamp(2.625rem,7.2vw,5.5rem)] leading-[1.06] font-normal"
            style={{ animationDelay: "0.14s" }}
          >
            <span className="block">
              Watch{" "}
              <em className="text-terra-soft font-turn italic">
                real experiences.
              </em>
            </span>
            {/* A real space between the blocks: it collapses visually, but
                the heading is read as one string by assistive tech and by
                search engines, and without it they get "experiences.Make". */}{" "}
            <span className="mt-1.5 block">
              Make one{" "}
              <em className="text-terra-soft font-turn italic">yours.</em>
            </span>
          </h1>

          {/* A narrower measure than the title's: roughly 68 characters, the
              readable column, so the lede reads as considered prose under
              the statement rather than a second banner. */}
          <p
            className="text-cream/75 emerge mt-10 max-w-xl text-lg leading-relaxed"
            style={{ animationDelay: "0.28s" }}
          >
            Every video is filmed by the people who host the experience. Book
            it, and bring the experience to life. Discover the Andaman Islands
            through real moments, not advertisements.
          </p>

          <div
            className="emerge mt-12 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row"
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
