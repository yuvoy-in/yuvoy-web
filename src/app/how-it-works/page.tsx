import type { Metadata } from "next";
import { PageHeader } from "@/components/site/page-header";
import { JourneyTrack } from "@/components/site/journey-track";
import { Section } from "@/components/ui/section";
import { TRAVELLER_JOURNEY, OPERATOR_JOURNEY } from "@/lib/site/journeys";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "The two Yuvoy journeys, step by step and kept separate: what a traveller will do, and what an operator will do. Marked honestly — almost all of it is still being built.",
  alternates: { canonical: "/how-it-works" },
};

/**
 * The full version of both journeys.
 *
 * The homepage carries a short teaser of this; here each journey gets its own
 * eight steps on its own surface, never interleaved. Steps are individually
 * labelled "Open now" or "Planned", so the page can describe payment, bookings
 * and payouts in detail without ever implying they are available.
 */
export default function HowItWorksPage() {
  return (
    <main>
      <PageHeader
        eyebrow="How it works"
        title="Two audiences."
        accent="Two separate journeys."
        lede={
          <>
            <p>
              Travellers want to know what a day is actually like. Operators
              want to know what it costs them and what they keep. Those are
              different questions, so the answers are kept apart.
            </p>
            <p className="mt-4">
              Every step below is marked. One is open today; the rest describe
              what is being built, and nothing here can be done on this site
              yet.
            </p>
          </>
        }
      />

      <JourneyTrack journey={TRAVELLER_JOURNEY} />
      <JourneyTrack journey={OPERATOR_JOURNEY} />

      <Section aria-labelledby="status-heading">
        <h2
          id="status-heading"
          className="font-display max-w-3xl text-2xl font-bold tracking-tight text-balance"
        >
          What you can actually do today
        </h2>
        <p className="text-forest/75 mt-5 max-w-2xl leading-relaxed">
          Join the waitlist as a traveller, or apply as a founding operator.
          That is the whole list. There is no booking, no payment, no account
          and no catalogue — and we would rather say so plainly than dress up a
          pre-launch page as a product.
        </p>
      </Section>
    </main>
  );
}
