import { Section, SectionHeading } from "@/components/ui/section";
import { PhonePreview } from "@/components/landing/phone-preview";

/**
 * The answer act: the story in three moves on the left, the product running
 * live on the right. The step rows share one fixed grid so nothing can drift
 * out of alignment, and the phone is the same Season One preview object the
 * e2e truthfulness guard scopes (its `data-preview` wrapper travels with it).
 *
 * The closing caveat is owner-approved canon, quoted verbatim; it is the
 * page's clearest statement that booking does not exist yet.
 */
const STEPS = [
  {
    n: "01",
    title: "Search a place, not a keyword",
    body: "Everything actually running there, in one feed.",
  },
  {
    n: "02",
    title: "Watch the real thing",
    body: "Filmed by the people who run it. You know in ten seconds.",
  },
  {
    n: "03",
    title: "Book without leaving",
    body: "One tap, direct with the operator, confirmed on the spot.",
  },
] as const;

export function Answer() {
  return (
    <Section id="how" tone="ink" aria-labelledby="answer-heading">
      <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-20">
        <div>
          <SectionHeading
            id="answer-heading"
            tone="ink"
            eyebrow="What Yuvoy does"
            title="Scroll. Watch."
            accent="Book."
            body="One feed of everything a destination offers, filmed by the people who run it. The booking happens right where the watching does."
          />

          <ol className="border-cream/12 mt-12 border-t">
            {STEPS.map((step) => (
              <li
                key={step.n}
                className="border-cream/12 grid grid-cols-[2.5rem_1fr] items-baseline gap-x-5 border-b py-6"
              >
                <span
                  aria-hidden
                  className="font-display text-terra-soft text-2xl leading-none"
                >
                  {step.n}
                </span>
                <div>
                  <h3 className="font-display tracking-display text-xl">
                    {step.title}
                  </h3>
                  <p className="text-cream/70 mt-1.5 text-[15px] leading-relaxed">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <p className="border-terra-soft/40 text-cream mt-10 border-l-2 py-1 pl-6 text-lg">
            Booking opens after the first curated collection is ready. The
            waitlist hears first.
          </p>
        </div>

        <div className="justify-self-center">
          <PhonePreview />
        </div>
      </div>
    </Section>
  );
}
