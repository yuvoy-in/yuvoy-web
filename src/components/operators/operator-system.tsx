import { SectionHeading } from "@/components/ui/section";
import { AppStack } from "@/components/operators/app-stack";

/**
 * The operator case, staged as a transformation: the improvised stack an
 * operator juggles today on the left, the one system that replaces it on the
 * right, and between them a single connector that reads "becomes".
 *
 * ## What this section carries, and what it no longer does
 *
 * It used to end in a "Season One roster" — three signed operators as cards,
 * plus a dashed fourth reading "your spot". The count is true and
 * owner-confirmed, and it still appears on the homepage cover where it belongs
 * (it is momentum, and a traveller's question too). It came off this page on
 * 2026-08-06 because on an application page a roster with an empty slot is
 * scarcity framing, and the operator page's own rule is that it promises
 * nothing it has not agreed.
 *
 * The right-hand panel now carries the three outcomes — show it, sell it, run
 * it — rather than a feature list. That merges what the brief listed as two
 * consecutive sections, on the grounds that a page which lists capabilities
 * and then lists outcomes has explained the same thing twice.
 *
 * **"Experience OS" appears once, small, as a product name.** Nothing on the
 * page requires the reader to know the phrase to follow the argument, which is
 * the condition under which it is allowed to appear at all.
 */
const OUTCOMES = [
  {
    title: "Show it",
    body: "Use real video to help travellers understand the experience.",
  },
  {
    title: "Sell it",
    body: "Manage details, pricing, availability and capacity.",
  },
  {
    title: "Run it",
    body: "Keep bookings, customers and payments together.",
  },
];

export function OperatorSystem() {
  return (
    <section
      id="system"
      aria-labelledby="operator-system-heading"
      className="bg-cream scroll-mt-16"
    >
      <div className="container-page py-14 sm:py-28">
        <div className="grid grid-cols-1 items-end gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionHeading
              id="operator-system-heading"
              eyebrow="One business. Too many tools."
              title="Too many tools to run"
              accent="one experience."
            />
          </div>
          <p className="text-forest/75 text-lg leading-relaxed lg:col-span-5">
            Dive centres, boat crews, guides and kitchens have all stitched
            together the same improvised stack, and none of it puts you where a
            traveller is looking.
          </p>
        </div>

        {/* The transformation: today's juggling act becomes one system. */}
        <div className="mt-14 grid grid-cols-1 items-stretch gap-5 lg:grid-cols-[1fr_auto_1fr]">
          <div className="border-cream-line bg-cream-deep rounded-edge flex w-full flex-col border p-7">
            <p className="label text-forest/75">Today</p>
            <div className="mt-6">
              <AppStack />
            </div>
            <p className="text-forest/75 mt-auto pt-6 text-sm leading-relaxed">
              Six tools, repeated admin, and no single place for travellers to
              discover and book what you run.
            </p>
          </div>

          <div
            aria-hidden
            className="flex items-center justify-center gap-3 px-2 lg:flex-col"
          >
            <span className="bg-cream-line h-px w-10 lg:h-10 lg:w-px" />
            <span className="label text-terra-deep">becomes</span>
            <span className="bg-cream-line h-px w-10 lg:h-10 lg:w-px" />
          </div>

          <div className="bg-forest text-cream rounded-edge relative w-full overflow-hidden p-7">
            <div aria-hidden className="grain" />
            <div className="relative flex h-full flex-col">
              <p className="label text-terra-soft">With Yuvoy</p>
              <h3 className="font-display tracking-display mt-5 text-3xl leading-tight font-normal text-balance">
                One place to show, sell and manage it.
              </h3>
              <ul className="border-cream/12 divide-cream/12 mt-7 flex flex-col divide-y border-t">
                {OUTCOMES.map((outcome) => (
                  <li key={outcome.title} className="py-4">
                    <p className="font-display tracking-display text-xl leading-snug font-normal">
                      {outcome.title}
                    </p>
                    <p className="text-cream/70 mt-1.5 text-sm leading-relaxed">
                      {outcome.body}
                    </p>
                  </li>
                ))}
              </ul>
              {/* No call to action here (owner direction, 2026-08-07). The
                  cover carries "Apply as a founding operator" two screens up
                  and the page closes on the application itself; a third
                  instance in between makes the page read as though it is
                  chasing rather than explaining. */}
              {/* The product name, once, as a footnote. Nothing above needs
                  it to make sense — that is the condition for it appearing. */}
              <p className="label text-cream/60 mt-8">
                Yuvoy Experience OS · in development
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
