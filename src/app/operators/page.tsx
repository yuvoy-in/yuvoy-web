import type { Metadata } from "next";
import { PageIntro } from "@/components/site/page-intro";
import { Section, SectionHeading } from "@/components/ui/section";
import { buttonVariants, ButtonArrow } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { OperatorSystem } from "@/components/operators/operator-system";
import { StatusNotice } from "@/components/site/status-notice";
import { LeadForms } from "@/components/landing/lead-forms";
import { ApplyAside } from "@/components/operators/apply-aside";
import { ContactGlance } from "@/components/site/contact-glance";
import {
  campaignSourceFromParam,
  DEFAULT_DESTINATION,
} from "@/lib/leads/registry";

export const metadata: Metadata = {
  // Absolute: the layout template appends " · Yuvoy", and this title already
  // names the product ("Yuvoy for Operators"). Without this it reads
  // "... · Yuvoy for Operators · Yuvoy".
  title: { absolute: "List and manage experiences · Yuvoy for Operators" },
  description:
    "Show what you offer through real video, manage availability, and bring enquiries, bookings and payments into one place. Yuvoy is onboarding founding operators now.",
  alternates: { canonical: "/operators" },
};

/**
 * The operator page: the whole operator case, and the application at the end
 * of it.
 *
 * Framed as an **application**, not a signup — an operator is agreeing to a
 * conversation, not to terms. That distinction is the whole page.
 *
 * ## The 2026-08-06 rewrite
 *
 * The page said the right things in the wrong proportion. A five-item "what
 * this is not" ran at full section scale on a dark surface, directly opposite
 * the offer, so the loudest thing on a page asking operators to apply was a
 * list of what had not been agreed. Every one of those statements is still
 * here and none has been softened — they are one compact status panel and four
 * FAQ answers instead of a section, which is the difference between being
 * straight with someone and talking yourself out of the conversation.
 *
 * The joining sequence also came down from eight steps to four. Eight
 * described a process that does not exist in that detail yet; four describe
 * what actually happens, which is a conversation.
 *
 * ## What may not appear here
 *
 * A commission rate, a payout schedule, a launch date, a guarantee of
 * bookings, or a rendering of an operator dashboard that has not been built.
 * The status panel covers the first four in one place, once.
 */
const STEPS = [
  {
    title: "Apply",
    body: "Tell us who you are, where you operate and what you offer.",
  },
  {
    title: "Speak with the team",
    body: "We learn how the experience currently runs.",
  },
  {
    title: "Build the first listing together",
    body: "We help structure the details and prepare the video.",
  },
  {
    title: "Launch",
    body: "The experience goes live when the destination collection opens.",
  },
];

const BENEFITS = [
  {
    title: "First collection",
    body: "Be considered for the initial experience collection in your destination.",
  },
  {
    title: "Listing support",
    body: "Get help preparing the first experience and video.",
  },
  {
    title: "Product input",
    body: "Help shape tools around real operational needs.",
  },
  {
    title: "No exclusivity",
    body: "Continue serving your own customers and existing channels.",
  },
];

const CONTENTS = [
  { href: "#system", label: "One place to run it" },
  { href: "#joining", label: "How joining works" },
  { href: "#benefits", label: "Founding operators" },
  { href: "#apply", label: "Questions & applying" },
];

/**
 * `?source=` is read, validated and dropped from the canonical.
 *
 * A campaign source arrives here as a query because the hop from
 * `/go/<source>#providers` is a client-side redirect that leaves no referrer
 * (yuvoy-web#70) — so the URL is the only carrier there is.
 *
 * **Validated, not trusted.** `campaignSourceFromParam` maps anything outside
 * the contract's enum to `web`, so a junk or hostile value can never reach the
 * API and come back as a 400 the applicant would read as a broken form.
 *
 * **The canonical stays `/operators`, and the query is not stripped after
 * reading.** This page is indexable, unlike `/go/*`, so `?source=ferry` could
 * otherwise be shared or crawled as a second URL for the same page — the
 * static canonical in `metadata` above already collapses them, which is the
 * standard fix and costs nothing. Stripping it client-side was the
 * alternative and was rejected: it would mean a history entry or a visible URL
 * change on every campaign arrival, to solve a problem the canonical already
 * solves.
 */
export default async function OperatorsPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string }>;
}) {
  const source = campaignSourceFromParam((await searchParams).source);

  return (
    <main>
      <PageIntro
        eyebrow="For operators"
        title="Run the experience."
        accent="Yuvoy helps people find and book it."
        lede={
          <>
            <p>
              Show what you offer through real video, manage availability, and
              bring enquiries, bookings and payments into one place.
            </p>
            {/* Where we are onboarding. Deliberately not a permanent
                restriction to three islands: operators elsewhere are being
                spoken to, and a page that says otherwise turns them away at
                the door. */}
            <p className="label text-cream/70 mt-8 flex items-start gap-2.5">
              <span
                aria-hidden
                className="bg-terra-soft mt-1.5 size-1 shrink-0"
              />
              Currently onboarding in the Andaman Islands and speaking with
              operators in other destinations.
            </p>
          </>
        }
        contents={CONTENTS}
      >
        {/* The one interior page with an action worth putting in the cover:
            applying is the whole purpose of the page. Native anchor, because a
            hash-only href through the router uses pushState, which does not
            move the page the way setting location.hash does. */}
        <a
          href="#apply"
          className={cn(
            buttonVariants({ variant: "paper", size: "lg" }),
            "flex w-full sm:inline-flex sm:w-auto",
          )}
        >
          Apply as a founding operator
          <ButtonArrow />
        </a>
      </PageIntro>

      <OperatorSystem />

      <Section tone="ink" id="joining" aria-labelledby="joining-heading">
        <SectionHeading
          id="joining-heading"
          tone="ink"
          eyebrow="How joining works"
          title="Join in four"
          accent="clear steps."
        />
        <ol className="border-cream/12 mt-14 grid grid-cols-1 gap-x-8 gap-y-10 border-t sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <li key={step.title} className="pt-8 sm:pr-6">
              <span className="label text-terra-soft">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="font-display tracking-display mt-4 text-xl leading-snug font-normal">
                {step.title}
              </h3>
              <p className="text-cream/70 mt-3 leading-relaxed">{step.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="benefits" aria-labelledby="benefits-heading">
        <SectionHeading
          id="benefits-heading"
          eyebrow="Founding operators"
          title="Built with the"
          accent="first operators."
        />
        <ul className="border-cream-line mt-14 grid grid-cols-1 gap-x-10 gap-y-10 border-t pt-10 sm:grid-cols-2">
          {BENEFITS.map((benefit) => (
            <li key={benefit.title}>
              <h3 className="font-display text-forest tracking-display text-xl leading-snug font-normal">
                {benefit.title}
              </h3>
              <p className="text-forest/75 mt-3 max-w-sm leading-relaxed">
                {benefit.body}
              </p>
            </li>
          ))}
        </ul>

        {/*
          Every statement that used to be a five-item section, in one panel.
          Nothing has been dropped: no rate, no schedule, no listing, no
          partnership, and terms agreed before anyone goes live. It sits after
          the offer and before the application, so an operator meets it while
          deciding rather than while being persuaded.
        */}
        <StatusNotice label="Pre-launch" className="mt-14">
          <p>
            Yuvoy is currently pre-launch. Applying starts a conversation; it
            does not create a listing, partnership or commercial agreement.
            Pricing, commissions and payout terms will be agreed before an
            operator goes live.
          </p>
        </StatusNotice>
      </Section>

      {/*
        The questions and the application, in one act.

        They were two sections until 2026-08-07 (owner direction), which put an
        operator through "here is what you might be worried about" and then
        "now fill this in" as two separate scrolls. Beside each other they are
        what they actually are: the things still going through someone's head
        while they apply. It is also exactly how the homepage closes for
        travellers, so both audiences now meet the same gesture.

        `#providers` rides along inside LeadForms wherever a provider form
        exists, so the long-lived operator anchor keeps resolving here.
      */}
      <LeadForms
        context={{ source, destinationKey: DEFAULT_DESTINATION.key }}
        audiences={["provider"]}
        initialAudience="provider"
        sectionId="apply"
        aside={<ApplyAside />}
      />

      {/* After the ask, not before it: the operator who read this far and did
          not apply is exactly the operator with a question. */}
      <ContactGlance />
    </main>
  );
}
