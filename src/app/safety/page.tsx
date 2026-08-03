import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/site/page-header";
import { Section, SectionHeading } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "Safety",
  description:
    "Where Yuvoy stands on safety before launch: what we will require of operators, what we have not built yet, and what is not yet decided.",
  alternates: { canonical: "/safety" },
};

/**
 * The safety page — the highest-risk page on the site.
 *
 * **Every statement here is either a verifiable fact about today or an
 * explicitly-labelled intention.** There is no verification process, no
 * refund policy, no waiver handling and no insurance arrangement, so this page
 * claims none of those. It says so, by name, in "What we have not built yet".
 *
 * That section is not a disclaimer to be trimmed when the page feels
 * negative. On a page about diving and open water, the absence of a claim is
 * the claim — a visitor who assumes a verification process exists because a
 * safety page did not mention its absence has been misled by omission.
 *
 * Before changing anything here, read the FAQ's "A word on water activities"
 * entry: the two must agree.
 */
const COMMITMENTS = [
  {
    title: "We will say what a day actually asks of you",
    body: "Fitness, experience level, certification, swimming ability and conditions — stated before you commit, not discovered at the jetty. This is how we intend every listing to read.",
  },
  {
    title: "We will not list an operator we would not go out with",
    body: "How we assess that is still being worked out, and until it is written down and running we will not describe it as a process or imply anyone has passed one.",
  },
  {
    title: "We would rather lose a booking than overstate readiness",
    body: "If a day is not right for someone, the honest answer is worth more to us than the booking. That is a standard we hold ourselves to; it is not yet a system.",
  },
  {
    title: "The sea decides",
    body: "Weather and sea state cancel days in the islands, and no platform changes that. What we can control is telling you early and being reachable when it happens.",
  },
];

const NOT_BUILT = [
  "An operator verification or accreditation process. None exists yet, and no operator on Yuvoy has been verified by us.",
  "A refund, cancellation or rescheduling policy. Nothing is bookable, so nothing is refundable, and no policy has been written or approved.",
  "Waiver, medical-declaration or insurance handling. None of it is built, and none of it is collected anywhere on this site.",
  "Incident reporting or on-the-ground support. Planned, not running.",
];

export default function SafetyPage() {
  return (
    <main>
      <PageHeader
        eyebrow="Safety"
        title="The sea deserves"
        accent="respect."
        lede={
          <>
            <p>
              Diving and open water are not activities to be casual about. This
              page sets out where we actually stand before launch — including,
              plainly, what we have not built.
            </p>
            <p className="mt-4">
              Nothing on Yuvoy is bookable today, so nothing here describes a
              safety process protecting a booking you can make. It describes the
              standard we are building to.
            </p>
          </>
        }
      />

      <Section aria-labelledby="commitments-heading">
        <SectionHeading
          id="commitments-heading"
          eyebrow="What we are building to"
          title="Four things we intend"
          accent="to hold to."
          body="These are intentions, stated as intentions. None of them is a process running today."
        />
        <ul className="border-cream-line mt-14 grid grid-cols-1 gap-px border-t sm:grid-cols-2">
          {COMMITMENTS.map((item, i) => (
            <li key={item.title} className="pt-10 sm:pr-10">
              <span className="label text-forest/75">0{i + 1}</span>
              <h3 className="font-display text-forest mt-5 text-xl font-bold tracking-tight">
                {item.title}
              </h3>
              <p className="text-forest/75 mt-3 leading-relaxed">{item.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="ink" aria-labelledby="not-built-heading">
        <SectionHeading
          id="not-built-heading"
          tone="ink"
          eyebrow="Being straight with you"
          title="What we have"
          accent="not built yet."
          body="Naming these matters more than the section above. On a page about the water, an unmentioned gap reads as a gap that is covered."
        />
        <ul className="border-cream/12 mt-12 max-w-3xl border-t">
          {NOT_BUILT.map((item) => (
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

      <Section aria-labelledby="today-heading">
        <SectionHeading
          id="today-heading"
          eyebrow="Today"
          title="Who you are actually"
          accent="dealing with."
          body={
            <>
              <p>
                Until Yuvoy opens, any experience you take in the islands is
                arranged directly between you and the operator running it, under
                their terms and their insurance. We are not a party to it and we
                do not vet it.
              </p>
              <p className="mt-4">
                If you have a question about how we intend to handle any of
                this, ask us when we get in touch — the answer will be the same
                as what is written here.
              </p>
            </>
          }
        />
        <Link
          href="/how-it-works"
          className="label text-terra-deep hover:text-forest mt-10 inline-block underline underline-offset-4"
        >
          See what is planned, step by step
        </Link>
      </Section>
    </main>
  );
}
