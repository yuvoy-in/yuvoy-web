import { Clapperboard, Compass, CalendarCheck } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/section";

/**
 * Watch · Feel · Book — the product, explained in three panels.
 *
 * **Type-led on purpose.** The reviewer asked for "genuine product screens";
 * there are none, because the product is not built and no rights-cleared media
 * exists. Rather than mock up a screen that would read as real — the exact
 * failure mode this rebuild is undoing — the panels are rendered in the site's
 * own design language, so they clearly illustrate an idea rather than
 * documenting a shipped feature.
 *
 * The Book panel's closing sentence is owner-approved canon and is quoted
 * verbatim. It is doing real work: it is the page's clearest statement that
 * booking does not exist yet. Do not soften or embellish it.
 */
const STEPS = [
  {
    icon: Clapperboard,
    label: "Watch",
    body: "See what the day is actually like — filmed by the person who runs it, not pulled from a stock library.",
  },
  {
    icon: Compass,
    label: "Feel",
    body: "Know whether it fits you: what the day asks of you, what it gives back, and who you would be spending it with.",
  },
  {
    icon: CalendarCheck,
    label: "Book",
    body: "Choose with clarity, in one motion, from the people running the experience themselves.",
  },
] as const;

export function WatchFeelBook() {
  return (
    <Section tone="ink" aria-labelledby="wfb-heading">
      <SectionHeading
        id="wfb-heading"
        tone="ink"
        eyebrow="How Yuvoy works"
        title="Watch. Feel."
        accent="Book."
        body="Three moments, one motion. This is what we are building — an illustration of the idea, not a picture of a product you can use today."
      />

      <ol className="border-cream/12 mt-16 grid grid-cols-1 gap-px border-t md:grid-cols-3">
        {STEPS.map((step, i) => (
          <li key={step.label} className="pt-10 md:pr-8">
            <div className="flex items-center gap-4">
              <span className="label text-terra-soft">0{i + 1}</span>
              <step.icon
                aria-hidden
                strokeWidth={1.25}
                className="text-terra-soft size-6"
              />
            </div>
            <h3 className="font-display mt-6 text-2xl font-bold tracking-tight">
              {step.label}
            </h3>
            <p className="text-cream/70 mt-3 leading-relaxed">{step.body}</p>
          </li>
        ))}
      </ol>

      {/* The honest caveat, given its own weight rather than buried in a footnote. */}
      <p className="border-terra-soft/40 text-cream mt-12 border-l-2 py-1 pl-6 text-lg">
        Booking opens after the first curated collection is ready.
      </p>
    </Section>
  );
}
