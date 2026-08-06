import { Section, SectionHeading } from "@/components/ui/section";
import { ProductDemo } from "@/components/landing/product-demo";

/**
 * The why act: the problem and the product in one frame, because they are
 * one thought. Until 2026-08-06 these were two sections, the observation
 * ("The hard part was never booking.") and the demo ("Scroll. Watch.
 * Book."); a visitor met the argument twice before seeing the point once.
 * This act shows it instead: the hunt on the left, the product running on
 * the right, one arrow between them.
 *
 * The left panel is reportage. Real product names, no logos, no invented
 * ratings; the collage is a picture of the chaos, so it is aria-hidden and
 * the pain list below carries the meaning for assistive tech. It must never
 * use the words the homepage truthfulness guard bans outside the preview.
 *
 * The section keeps the id `how`: the cover's "How it works" button lands
 * here, and this is now the section that shows it.
 */

const SOURCES = [
  { name: "YouTube", twist: "-rotate-2" },
  { name: "Google", twist: "rotate-1 translate-y-1" },
  { name: "Instagram", twist: "rotate-2" },
  { name: "Tripadvisor", twist: "-rotate-1 translate-y-0.5" },
  { name: "Blogs from 2019", twist: "rotate-1" },
  { name: "A WhatsApp number", twist: "-rotate-2 translate-y-1" },
];

const PAINS = [
  "Scattered sources",
  "Hard to compare",
  "Uncertain choices",
  "Time-consuming",
];

export function WhyYuvoy() {
  return (
    <Section id="how" aria-labelledby="why-heading">
      <SectionHeading
        id="why-heading"
        className="mx-auto text-center"
        eyebrow="Why Yuvoy"
        title="From too many tabs to"
        accent="one simple place."
        body="See the experience, understand the details, and book in one flow."
      />

      <div className="mt-14 grid grid-cols-1 items-center gap-10 sm:mt-20 lg:grid-cols-[minmax(0,4fr)_auto_minmax(0,6fr)] lg:gap-8">
        {/* ------------------------------------------------ without Yuvoy */}
        <div>
          <p className="label text-forest/75">Without Yuvoy</p>
          <p className="font-display tracking-display mt-3 text-2xl leading-snug text-balance">
            Too many places. Too much guesswork.
          </p>

          {/* The hunt, as a desk: scattered tabs, a shortlist that never
              resolves, the note every trip planner ends up writing. Pure
              illustration; the pain list below is the accessible summary. */}
          <div aria-hidden className="mt-8 select-none">
            <div className="flex flex-wrap gap-2.5">
              {SOURCES.map((source) => (
                <span
                  key={source.name}
                  className={`border-cream-line bg-cream-deep text-forest/75 rounded-edge border px-3.5 py-2 text-sm ${source.twist}`}
                >
                  {source.name}
                </span>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-start gap-4">
              <div className="border-cream-line bg-cream-deep rounded-edge w-44 -rotate-1 border p-3.5">
                <p className="text-forest/75 tracking-label text-[11px] font-medium uppercase">
                  Shortlist · day 3
                </p>
                <ul className="text-forest/75 mt-2.5 space-y-2 text-sm">
                  {["Nemo Reef", "Lighthouse", "Mangrove Wall"].map((spot) => (
                    <li
                      key={spot}
                      className="border-cream-line flex items-center justify-between gap-3 border-b pb-2 last:border-b-0 last:pb-0"
                    >
                      {spot}
                      <span className="text-terra-deep font-bold">?</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-cream-line bg-cream rounded-edge rotate-2 border p-3.5">
                <p className="font-display text-forest tracking-display text-xl leading-snug">
                  Which one
                  <br />
                  is best?
                </p>
                <p className="text-forest/70 mt-2 text-xs">27 tabs open</p>
              </div>
            </div>
          </div>

          <ul className="mt-8 flex flex-wrap gap-2">
            {PAINS.map((pain) => (
              <li
                key={pain}
                className="border-cream-line text-forest/75 rounded-edge inline-flex items-center gap-2 border px-3 py-1.5 text-sm"
              >
                <svg
                  viewBox="0 0 12 12"
                  fill="none"
                  className="text-terra-deep size-2.5 flex-none"
                  aria-hidden
                >
                  <path
                    d="M2 2l8 8M10 2l-8 8"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
                {pain}
              </li>
            ))}
          </ul>
        </div>

        {/* The turn of the story: one arrow, chaos into flow. */}
        <div aria-hidden className="flex justify-center self-center">
          <svg
            viewBox="0 0 56 16"
            fill="none"
            className="text-terra w-12 rotate-90 lg:w-14 lg:rotate-0"
          >
            <path d="M0 8h51" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M46 2.5L52.5 8L46 13.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* --------------------------------------------------- with Yuvoy */}
        <div>
          <p className="label text-terra-deep">With Yuvoy</p>
          <p className="font-display tracking-display mt-3 text-2xl leading-snug text-balance">
            Everything you need. In one flow.
          </p>
          <div className="mt-10">
            <ProductDemo />
          </div>
        </div>
      </div>

      {/*
        The honest caveat is owner-approved canon, quoted verbatim; it is
        the page's clearest statement that booking does not exist yet, and
        it must sit with the section that just showed a payment.
      */}
      <div className="border-cream-line mt-20 border-t pt-10 text-center sm:mt-24">
        <p className="text-forest/75 mx-auto max-w-xl text-lg leading-relaxed">
          Booking opens after the first curated collection is ready. The
          waitlist hears first.
        </p>
        <p className="font-display tracking-display mt-8 text-[clamp(1.75rem,4vw,2.625rem)] leading-tight text-balance">
          Less searching.{" "}
          <span className="relative whitespace-nowrap">
            Better decisions.
            <span
              aria-hidden
              className="bg-terra absolute -bottom-1 left-0 h-0.5 w-full"
            />
          </span>
        </p>
      </div>
    </Section>
  );
}
