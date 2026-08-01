import { Section, SectionHeading } from "@/components/ui/section";

/**
 * The two journeys, previewed.
 *
 * Deliberately distinct from Watch/Feel/Book: that section explains what the
 * product does, this one explains that there are *two different audiences*
 * with different questions — the reviewer's point that the journeys must never
 * be interleaved. The full eight-step version of each lives on /how-it-works,
 * a later rebuild issue; until that page exists nothing here links to it.
 *
 * Every step past discovery is written in the future tense on purpose. A
 * traveller cannot pay today and an operator cannot receive a payout today,
 * and no wording here may imply otherwise.
 */
const JOURNEYS = [
  {
    audience: "For travellers",
    title: "Watch, then decide",
    steps: [
      "Watch short video from the people who run each experience.",
      "Read what a day actually involves — and what it asks of you.",
      "Book and pay in one motion, once booking opens.",
    ],
  },
  {
    audience: "For operators",
    title: "Show what you run",
    steps: [
      "Apply to join, and verify who you are and what you run.",
      "Build the experience with us, filmed honestly rather than staged.",
      "Take bookings and get paid, once the platform opens.",
    ],
  },
] as const;

export function JourneysTeaser() {
  return (
    <Section aria-labelledby="journeys-heading">
      <SectionHeading
        id="journeys-heading"
        eyebrow="How it will work"
        title="Two sides,"
        accent="two different questions."
        body="Travellers want to know what a day is really like. Operators want to know what it costs them and what they keep. Those are separate stories, so we tell them separately."
      />

      <div className="mt-16 grid grid-cols-1 gap-px lg:grid-cols-2">
        {JOURNEYS.map((journey) => (
          <div
            key={journey.audience}
            className="border-cream-line border-t pt-10 lg:pr-12"
          >
            <p className="label text-terra-deep">{journey.audience}</p>
            <h3 className="font-display text-teal mt-5 text-2xl font-bold tracking-tight">
              {journey.title}
            </h3>
            <ol className="mt-8 flex flex-col">
              {journey.steps.map((step, i) => (
                <li
                  key={step}
                  className="border-cream-line text-teal/75 flex gap-5 border-b py-4 last:border-b-0"
                >
                  <span className="label text-teal/75 shrink-0 pt-1">
                    0{i + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>

      <p className="text-teal/75 border-cream-line mt-12 border-t pt-6 text-sm">
        This is the journey we&rsquo;re building — not one you can take today.
        Join the waitlist and you&rsquo;ll hear from us as it opens.
      </p>
    </Section>
  );
}
