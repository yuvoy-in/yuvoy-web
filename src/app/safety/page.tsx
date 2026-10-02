import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/site/page-header";
import { Section, SectionHeading } from "@/components/ui/section";
import { StatusNotice } from "@/components/site/status-notice";

export const metadata: Metadata = {
  title: "Trust & safety",
  description:
    "What Yuvoy checks before an operator can sell, where each listing's cancellation policy is shown, and, plainly, what Yuvoy does not do.",
  alternates: { canonical: "/safety" },
};

/**
 * The safety page, the highest-risk page on the site.
 *
 * **Every statement here is either a verifiable fact about today or an
 * explicitly-labelled gap.** On a page about open water the absence of a claim
 * is itself a claim, so the rule stands: a gap that stops being named here has
 * been hidden, not fixed.
 *
 * ## Rewritten for an open Yuvoy (yuvoy-web#170)
 *
 * Until this change the page said booking was not live, that no operator had
 * been verified and that no cancellation policy had been written. By the time
 * the app was taking bookings none of that was true, and a page that is wrong
 * about safety in the cautious direction is still wrong. Each statement below
 * now comes from the app's own wording or from the API contract it runs on,
 * so it can be checked rather than taken on trust:
 *
 * - **What is checked.** A listing can be sold only while every credential its
 *   market and activity require is "on file, verified and unexpired"
 *   (`Experience.bookable`), and an operator shows as Verified only when every
 *   mandatory credential is ("a statement about evidence we hold, not a
 *   badge", `OperatorSummary.verified`).
 * - **The cancellation policy.** Shown on the listing before booking, frozen
 *   onto the booking at checkout, and the refund is shown before a
 *   cancellation is confirmed (the app's Help, "How do I cancel?").
 * - **Health questions.** Checkout asks them where the activity needs it, with
 *   a minimum age (`Experience.safety`; live on the dive listings).
 * - **The gaps.** The traveller product collects no waiver and arranges no
 *   insurance (neither exists anywhere in the traveller contract), Yuvoy does
 *   not run the trips, and Help is a message a person answers, not an
 *   emergency line.
 *
 * What the page does NOT say: that anyone can book right now (the app is due
 * to ask for an invite, yuvoy-api#195), or any assurance e2e/safety.spec.ts
 * bans ("all operators are checked", "fully insured", "we verify").
 *
 * Before changing anything, read the "Honest conditions" entry on `/explore`:
 * both surfaces make the same promise about conditions taking priority over a
 * booking, and an e2e test fails if either is softened on its own.
 */
const STANDARDS = [
  {
    title: "Operators are checked before they sell",
    body: "A listing can only be booked while every document its activity requires is on file with us, checked by our team and in date. If one lapses, the listing stops selling. An operator is marked Verified only when every document they must hold is in place.",
  },
  {
    title: "Requirements made clear",
    body: "A listing says what the day asks of you: its requirements and the operator's own safety notes. Where an activity needs it, such as diving, checkout asks health questions and a minimum age before a booking is made.",
  },
  {
    title: "The cancellation policy, up front",
    body: "A listing's cancellation policy is on its page before you book, and the same terms are kept on your booking. When you cancel, the app shows exactly what comes back before you confirm.",
  },
  {
    title: "Conditions come first",
    // Shared verbatim with /explore's "Honest conditions". Change both.
    body: "Weather and safety decisions take priority over completing a booking.",
  },
];

export default function SafetyPage() {
  return (
    <main>
      <PageHeader
        eyebrow="Trust & safety"
        title="Clear expectations before"
        accent="every experience."
        lede="Experiences can involve weather, water, physical effort and local conditions. On Yuvoy, each listing says what its day asks of you before you book."
      />

      <Section aria-labelledby="standards-heading">
        <SectionHeading
          id="standards-heading"
          eyebrow="What is in place"
          title="Four things"
          accent="in place today."
        />
        <ul className="border-paper-line mt-14 grid grid-cols-1 gap-x-10 gap-y-10 border-t pt-10 sm:grid-cols-2">
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
          title="What Yuvoy"
          accent="does not do."
          body="Naming these matters more than the list above. On a page about the water, an unmentioned gap reads as a gap that is covered."
        />

        {/*
          One panel, every gap, none of them optional. Each sentence is
          load-bearing and asserted by e2e/safety.spec.ts:
          - Yuvoy does not run the experiences
          - it collects no waiver and arranges no insurance
          - Help is a message to a person, not an emergency line
          Rewriting this block means updating that spec deliberately, which is
          the point of the spec.
        */}
        <StatusNotice tone="ink" className="mt-12 max-w-3xl">
          <p>
            Yuvoy does not run the experiences. The operator running your trip
            is who looks after you on the day.
          </p>
          <p>
            Yuvoy does not collect waivers and does not arrange insurance for
            you.
          </p>
          <p>
            Help in the app reaches a person at Yuvoy by message. It is not an
            emergency line.
          </p>
        </StatusNotice>

        {/* `/#how`, the homepage section that owns how Yuvoy works. This
            pointed at `/explore#how-it-works`, an anchor that stopped
            existing when that section moved (yuvoy-web#170). */}
        <Link
          href="/#how"
          className="label tap-target text-terra-soft hover:text-paper mt-12 inline-block underline underline-offset-4 transition-colors duration-200"
        >
          See how Yuvoy works
        </Link>
      </Section>
    </main>
  );
}
