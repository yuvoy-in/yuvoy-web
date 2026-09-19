import Link from "next/link";
import { Section, SectionHeading } from "@/components/ui/section";
import { buttonVariants, ButtonArrow } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { operatorHref, type LeadSource } from "@/lib/leads/registry";

/**
 * The other side of the marketplace, named once.
 *
 * ## Why this exists on a page addressed to travellers
 *
 * The homepage dropped the operator case entirely on 2026-08-04, because at
 * the time it was a full pitch — six apps, an Experience OS, a signed roster —
 * that a traveller had to read past on the way to a form. That was the right
 * fix for the wrong problem: the issue was never that operators were
 * mentioned, it was that they were *argued at*.
 *
 * This is three sentences and a way out. It answers the question a traveller
 * genuinely has after watching the product tour ("who is filming all this?")
 * and it gives an operator who landed here a door, rather than making them
 * hunt the header for it. The full case still lives on `/operators` and is
 * still the only place it is made.
 *
 * ## The surface (owner direction, 2026-08-07)
 *
 * Paper, having swapped with the first-launch act above it. The page now
 * alternates the whole way down — forest cover, paper why, forest
 * destinations, paper operators, forest form, paper contact, forest footer —
 * instead of running two paper acts and then three dark ones. Every join is a
 * tone change, so not one of them needs a rule drawn across it.
 */
const OUTCOMES = [
  {
    title: "Show it",
    body: "Turn real footage into a clear experience listing.",
  },
  {
    title: "Sell it",
    body: "Set your details, availability and capacity.",
  },
  {
    title: "Run it",
    body: "Keep bookings and customers together.",
  },
];

export function OperatorTeaser({ source }: { source: LeadSource }) {
  return (
    /*
      No seam needed. This act was forest and met the forest registration
      block below it, so it had to draw its own hairline or the two read as
      one enormous dark field. On paper it meets that block at a real tone
      change, which separates them better than any rule could.
    */
    <Section aria-labelledby="operators-heading">
      <SectionHeading
        id="operators-heading"
        eyebrow="For operators"
        title="You run the experience."
        accent="Yuvoy helps people find it."
        body="Show what you offer through real video, manage availability, and bring enquiries, bookings and payments into one place."
      />

      {/* A plain list on a rule, not three bordered cards: boxes inside a
          box is the SaaS grid this rebuild exists to get away from. */}
      <ul className="border-paper-line mt-10 grid grid-cols-1 gap-x-10 gap-y-8 border-t pt-8 sm:mt-14 sm:grid-cols-3 sm:gap-y-10 sm:pt-10">
        {OUTCOMES.map((outcome) => (
          <li key={outcome.title}>
            <h3 className="font-display tracking-display text-2xl leading-snug font-normal">
              {outcome.title}
            </h3>
            <p className="text-forest/75 mt-3 max-w-xs leading-relaxed">
              {outcome.body}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-10 flex flex-col items-start gap-5 sm:mt-12 sm:flex-row sm:items-center sm:gap-8">
        {/* Both links carry the campaign source. On `/go/ferry` this act is
            rendered by the same page an operator scanned into, so a link that
            dropped it would lose the attribution exactly the way the legacy
            anchor did (yuvoy-web#70). `operatorHref` returns a clean
            `/operators` for organic traffic. */}
        <Link
          href={operatorHref(source, "#apply")}
          className={cn(
            // `primary`, not `paper`: CTAs are monochrome and swap grounds
            // with the surface — forest fill on paper, paper fill on forest
            // (design system §5). Leaving `paper` here would put a paper
            // button on a paper section.
            buttonVariants({ variant: "primary", size: "lg" }),
            "flex w-full sm:w-auto",
          )}
        >
          Apply as a founding operator
          <ButtonArrow />
        </Link>
        <Link
          href={operatorHref(source)}
          className="label tap-target text-forest/75 hover:text-forest underline underline-offset-4 transition-colors duration-200"
        >
          See how Yuvoy works for operators
        </Link>
      </div>
    </Section>
  );
}
