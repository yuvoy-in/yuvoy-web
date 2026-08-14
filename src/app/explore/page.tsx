import type { Metadata } from "next";
import Link from "next/link";
import { Section, SectionHeading } from "@/components/ui/section";
import { PageIntro } from "@/components/site/page-intro";
import { ExperienceCategoryGrid } from "@/components/experiences/experience-category-grid";
import { StatusNotice } from "@/components/site/status-notice";
import { buttonVariants, ButtonArrow } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { VIEWPORT_ON_FOREST } from "@/lib/site/theme";
import {
  SEASON_CATEGORIES,
  WIDER_CATEGORIES,
} from "@/lib/site/experience-categories";

/** This route opens on a forest cover; Safari's top glass follows
    theme-color, so the chrome must agree with it (see lib/site/theme). */
export const viewport = VIEWPORT_ON_FOREST;

export const metadata: Metadata = {
  title: "Explore experiences and destinations",
  description:
    "See what a place actually offers through videos from the people who run the experiences. Yuvoy is opening first in the Andaman Islands.",
  alternates: { canonical: "/explore" },
};

/**
 * `/explore` — the permanent consumer-facing discovery page.
 *
 * ## What this replaced
 *
 * Four pages: `/destinations`, `/experiences`, `/how-it-works` and
 * `/travellers`. They repeated each other because they were four answers to
 * one question, and a visitor who read all four met the same three benefits
 * four times.
 *
 * ## What came back off it, on 2026-08-07
 *
 * This page had itself become a second telling of the homepage: the same
 * destination triptych, and the same phone tour. Both are gone. **Where Yuvoy
 * opens and how it works are the homepage's job** — a visitor meets them on
 * arrival, and repeating them here taught a reader that the site says
 * everything twice. `/destinations` and `/how-it-works` now redirect to the
 * homepage sections that own them.
 *
 * What is left is the one thing this page uniquely answers: **what kind of day
 * you can have.** The category grid moved here from the homepage in the same
 * change, with its photography, because browsing is the point of this page and
 * was a third answer on that one.
 *
 * ## The rule this page has to keep
 *
 * **It must not become an Andaman page.** The headline says "wherever you are
 * going" for that reason, and every category is a kind of day rather than a
 * place. A second market changes the data, not this file.
 *
 * ## What it may not grow
 *
 * No search results, no counts, no prices, no Book buttons, no filter that
 * filters nothing. Until real listings are connected this page describes kinds
 * of day; when they are, the grid takes data and nothing here needs redesign.
 */
const CONTENTS = [
  { href: "#experiences", label: "Experiences" },
  { href: "#expectations", label: "What to expect" },
];

const EXPECTATIONS = [
  {
    title: "Clear requirements",
    body: "Experience level, timing and what to bring should be clear before you book.",
  },
  {
    title: "Real operators",
    body: "Experiences are shown by the people who actually run them.",
  },
  {
    title: "Honest conditions",
    // The load-bearing half of this sentence is repeated verbatim on /safety
    // and an e2e test fails if either surface softens it on its own.
    body: "Weather and safety decisions take priority over completing a booking, and changes should be communicated clearly.",
  },
];

export default function ExplorePage() {
  return (
    <main>
      <PageIntro
        eyebrow="Explore Yuvoy"
        title="Find real experiences,"
        accent="wherever you are going."
        lede="See what a place actually offers through videos from the people who run the experiences."
        contents={CONTENTS}
      />

      {/* ------------------------------------------------------- experiences */}
      <Section id="experiences" aria-labelledby="experiences-heading">
        <SectionHeading
          id="experiences-heading"
          eyebrow="What you can discover"
          title="Choose the kind of day"
          accent="you want."
          body="From time on the water to food, culture and local life, Yuvoy is built around real things you can take part in."
        />

        <ExperienceCategoryGrid
          categories={SEASON_CATEGORIES}
          className="mt-14 sm:mt-16"
        />

        {/* The wider vocabulary, quietly. Present so the site does not read as
            a diving product, sized so it does not compete with the four the
            first season actually leads with. */}
        <p className="label text-forest/75 mt-16">
          Also part of Yuvoy, and lighter this season
        </p>
        <ExperienceCategoryGrid
          categories={WIDER_CATEGORIES}
          scale="quiet"
          className="mt-6"
        />

        <StatusNotice label="Collection preview" className="mt-14">
          <p>
            These are the kinds of day the first collection is being built
            around. There are no listings on Yuvoy yet, so nothing here is
            browsable or bookable, and no prices or availability are shown.
          </p>
        </StatusNotice>
      </Section>

      {/* ------------------------------------------------------------- trust */}
      <Section
        tone="ink"
        id="expectations"
        aria-labelledby="expectations-heading"
      >
        <SectionHeading
          id="expectations-heading"
          tone="ink"
          eyebrow="What to expect"
          title="Know what to expect"
          accent="before you go."
        />

        <ul className="border-cream/12 mt-14 grid grid-cols-1 gap-x-10 gap-y-10 border-t pt-10 sm:mt-16 sm:grid-cols-3">
          {EXPECTATIONS.map((item) => (
            <li key={item.title}>
              <h3 className="font-display tracking-display text-2xl leading-snug font-normal">
                {item.title}
              </h3>
              <p className="text-cream/70 mt-3 max-w-xs leading-relaxed">
                {item.body}
              </p>
            </li>
          ))}
        </ul>

        <Link
          href="/safety"
          className={cn(
            buttonVariants({ variant: "outlineOnDark", size: "lg" }),
            "mt-14 flex w-full sm:inline-flex sm:w-auto",
          )}
        >
          Read about safety
          <ButtonArrow />
        </Link>
      </Section>

      {/* --------------------------------------------------------------- ask */}
      <Section aria-labelledby="explore-cta-heading">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow text-terra-deep">Early access</p>
          <h2
            id="explore-cta-heading"
            className="font-display tracking-display mt-6 text-[clamp(2.125rem,5vw,3.375rem)] leading-[1.04] font-normal text-balance"
          >
            Be first to experience{" "}
            <em className="text-terra font-turn italic">Yuvoy.</em>
          </h2>
          <p className="text-forest/75 mt-6 text-lg leading-relaxed">
            Join the waitlist and we will contact you when the first experiences
            for your destination are ready.
          </p>
          <Link
            href="/waitlist"
            className={cn(
              buttonVariants({ size: "lg" }),
              "mt-10 flex w-full sm:inline-flex sm:w-auto",
            )}
          >
            Join the waitlist
            <ButtonArrow />
          </Link>
        </div>
      </Section>
    </main>
  );
}
