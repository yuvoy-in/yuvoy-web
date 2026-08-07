import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/site/page-header";
import { Section, SectionHeading } from "@/components/ui/section";
import { StatusNotice } from "@/components/site/status-notice";

export const metadata: Metadata = {
  title: "Trust & safety",
  description:
    "Where Yuvoy stands on safety before launch: the standards every experience is being built to meet, and, plainly, what is not built yet.",
  alternates: { canonical: "/safety" },
};

/**
 * The safety page — the highest-risk page on the site.
 *
 * **Every statement here is either a verifiable fact about today or an
 * explicitly-labelled intention.** There is no verification process, no refund
 * policy, no waiver handling and no insurance arrangement, so this page claims
 * none of those, and says so by name.
 *
 * ## Simplified on 2026-08-06, without losing a single disclosure
 *
 * The page ran two full sections of equal weight — four commitments, then four
 * things not built, each with its own heading and marker — followed by a third
 * repeating that Yuvoy is not a party to anything. Read end to end it was more
 * retraction than standard.
 *
 * What changed is the shape, not the content. The four standards are now a
 * clean list, and **every disclosure is preserved in one status panel**: no
 * operator verified, no policy written or approved, waiver and insurance
 * handling not built, incident support not running, and no party to anything
 * arranged today. On a page about open water the absence of a claim is itself
 * a claim, so the rule stands: a gap that stops being named here has been
 * hidden, not fixed.
 *
 * Before changing anything, read the "Honest conditions" entry on `/explore`:
 * both surfaces make the same promise about conditions taking priority over a
 * booking, and an e2e test fails if either is softened on its own.
 */
const STANDARDS = [
  {
    title: "Requirements made clear",
    body: "Fitness, swimming ability, certifications and experience level should be visible before booking.",
  },
  {
    title: "Operators assessed appropriately",
    body: "Verification requirements will depend on the activity and local rules.",
  },
  {
    title: "Conditions come first",
    // Shared verbatim with /explore's "Honest conditions". Change both.
    body: "Weather and safety decisions take priority over completing a booking.",
  },
  {
    title: "Support when plans change",
    body: "Cancellations, changes and meeting details should be communicated clearly.",
  },
];

export default function SafetyPage() {
  return (
    <main>
      <PageHeader
        eyebrow="Trust & safety"
        title="Clear expectations before"
        accent="every experience."
        lede="Experiences can involve weather, water, physical effort and local conditions. Yuvoy is being designed so these details are clear before anyone books."
      />

      <Section aria-labelledby="standards-heading">
        <SectionHeading
          id="standards-heading"
          eyebrow="The standard"
          title="Four things every experience"
          accent="is being built to meet."
        />
        <ul className="border-cream-line mt-14 grid grid-cols-1 gap-x-10 gap-y-10 border-t pt-10 sm:grid-cols-2">
          {STANDARDS.map((item) => (
            <li key={item.title}>
              <h3 className="font-display text-forest tracking-display text-xl leading-snug font-normal">
                {item.title}
              </h3>
              <p className="text-forest/75 mt-3 max-w-sm leading-relaxed">
                {item.body}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="ink" aria-labelledby="status-heading">
        <SectionHeading
          id="status-heading"
          tone="ink"
          eyebrow="Being straight with you"
          title="What is not"
          accent="built yet."
          body="Naming these matters more than the standards above. On a page about the water, an unmentioned gap reads as a gap that is covered."
        />

        {/*
          One panel, every disclosure, none of them optional. Each sentence is
          load-bearing and asserted by e2e/safety.spec.ts:
          - no operator on Yuvoy has been verified by us
          - no cancellation or refund policy has been written or approved
          - waiver, medical and insurance handling: none of it is built
          - incident support is planned, not running
          Rewriting this block means updating that spec deliberately, which is
          the point of the spec.
        */}
        <StatusNotice tone="ink" className="mt-12 max-w-3xl">
          <p>
            Booking is not live yet, and Yuvoy&rsquo;s operator-verification,
            cancellation, refund and incident-support processes are still being
            developed. These standards describe what the live platform is being
            built to support.
          </p>
          <p>
            Specifically: no operator on Yuvoy has been verified by us; no
            cancellation or refund policy has been written or approved; waiver,
            medical-declaration and insurance handling are not built, and none
            of it is collected anywhere on this site; and incident reporting and
            on-the-ground support are planned, not running.
          </p>
          <p>
            Until Yuvoy opens, any experience you take is arranged directly
            between you and the operator running it, under their terms and their
            insurance.
          </p>
        </StatusNotice>

        <Link
          href="/explore#how-it-works"
          className="label tap-target text-terra-soft hover:text-cream mt-12 inline-block underline underline-offset-4 transition-colors duration-200"
        >
          See how Yuvoy works
        </Link>
      </Section>
    </main>
  );
}
