import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/site/page-header";
import { Section, SectionHeading } from "@/components/ui/section";
import { buttonVariants, ButtonArrow } from "@/components/ui/button";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "For operators",
  description:
    "Applying as a founding operator on Yuvoy: what it is, what it is not, and what has and has not been decided about commercial terms.",
  alternates: { canonical: "/operators" },
};

/**
 * The operator page.
 *
 * Framed as an **application**, not a signup — an operator is agreeing to a
 * conversation, not to terms. That distinction is the whole page.
 *
 * The "what this is not" section is deliberately as prominent as the offer.
 * Commission, settlement, payouts and self-serve tooling do not exist and no
 * terms have been agreed; an operator who signs up on the strength of an
 * implied rate and later finds a different one is a worse outcome than an
 * operator who never applied.
 */
const OFFER = [
  {
    title: "Launch with the first listings",
    body: "Operators who join before we open are set up in the first wave, rather than joining a catalogue that already exists.",
  },
  {
    title: "Shape how it works",
    body: "The tooling is being designed now. What you tell us about running real days — weather, capacity, no-shows, gear — is what it gets built around.",
  },
  {
    title: "Help with the content",
    body: "The listings are video. We plan to build the first ones with you rather than sending a specification and hoping.",
  },
  {
    title: "A conversation on WhatsApp",
    body: "Applying starts a discussion about what you offer. It creates no listing, no obligation and no exclusivity.",
  },
];

const NOT = [
  "A commission rate. None is set, and any number you have seen elsewhere is not ours.",
  "A settlement or payout schedule. Payouts are not built.",
  "Self-serve tooling. There is no operator portal, calendar or dashboard yet.",
  "A guarantee of bookings, traffic or revenue. We will not put a number on demand that does not exist.",
  "An exclusivity requirement. Your walk-ins and your regulars are yours.",
];

export default function OperatorsPage() {
  return (
    <main>
      <PageHeader
        eyebrow="For operators"
        title="You already run something people love."
        accent="Show it properly."
        lede="If you run dives, boat days, kitchens or walks across Havelock, Neil or Port Blair, we would like to talk before we open — while the decisions that will affect you are still being made."
      >
        <Link
          href="/waitlist?audience=provider"
          className={cn(
            buttonVariants({ size: "lg" }),
            "flex w-full sm:inline-flex sm:w-auto",
          )}
        >
          Apply as a founding operator
          <ButtonArrow />
        </Link>
      </PageHeader>

      <Section aria-labelledby="offer-heading">
        <SectionHeading
          id="offer-heading"
          eyebrow="What founding-operator status means"
          title="Early involvement,"
          accent="not early terms."
        />
        <ul className="border-cream-line mt-14 grid grid-cols-1 gap-px border-t sm:grid-cols-2">
          {OFFER.map((item, i) => (
            <li key={item.title} className="pt-10 sm:pr-10">
              <span className="label text-forest/75">0{i + 1}</span>
              <h3 className="font-display text-forest mt-5 text-xl font-normal tracking-tight">
                {item.title}
              </h3>
              <p className="text-forest/75 mt-3 leading-relaxed">{item.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="ink" aria-labelledby="not-heading">
        <SectionHeading
          id="not-heading"
          tone="ink"
          eyebrow="Being straight with you"
          title="What this"
          accent="is not."
          body="Everything below is genuinely undecided. We would rather you know that before you apply than after."
        />
        <ul className="border-cream/12 mt-12 max-w-3xl border-t">
          {NOT.map((item) => (
            <li
              key={item}
              className="border-cream/12 text-cream/70 flex gap-5 border-b py-5 leading-relaxed"
            >
              <span
                aria-hidden
                className="bg-terra-soft mt-3 size-1 shrink-0"
              />
              {item}
            </li>
          ))}
        </ul>
      </Section>

      <Section aria-labelledby="apply-heading">
        <SectionHeading
          id="apply-heading"
          eyebrow="Applying"
          title="What we ask for,"
          accent="and why."
          body="Your name, your business, a WhatsApp number, the islands you cover and what you mainly run. The number is required because onboarding conversations happen there — not because we intend to message you about anything else."
        />
        <Link
          href="/waitlist?audience=provider"
          className={cn(
            buttonVariants({ size: "lg" }),
            "mt-12 flex w-full sm:inline-flex sm:w-auto",
          )}
        >
          Apply as a founding operator
          <ButtonArrow />
        </Link>
      </Section>
    </main>
  );
}
