import Link from "next/link";
import { SectionHeading } from "@/components/ui/section";
import { buttonVariants, ButtonArrow } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { Reveal } from "@/components/motion/reveal";
import { AppStack } from "@/components/landing/app-stack";

/**
 * Act 04 — the engine. Operators are the supply side of the flywheel and the
 * harder side to win, so they get the page's second product story: the
 * six-app stack they run today, struck through and replaced.
 *
 * The signed-operators row is real momentum: **3 founding operators is a true
 * count, confirmed by the owner (2026-08-03).** The three slot cards describe
 * those real signings; the dashed fourth is the invitation. Update these only
 * to match reality.
 */
const SIGNED_SLOTS = [
  { what: "Dive centre", where: "Havelock" },
  { what: "Sea walk & snorkel", where: "Neil" },
  { what: "Boats & island days", where: "Port Blair" },
];

export function Engine() {
  return (
    <section
      id="operators"
      aria-labelledby="engine-heading"
      className="bg-cream-deep border-cream-line scroll-mt-16 border-y"
    >
      <div className="container-page py-20 sm:py-28">
        <div className="grid grid-cols-1 items-end gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <SectionHeading
              id="engine-heading"
              eyebrow="04 — For operators"
              title="You run a business across"
              accent="six apps."
            />
          </Reveal>
          <Reveal delay={0.12} className="lg:col-span-5">
            <p className="text-forest/75 text-lg leading-relaxed">
              Dive centres, boat crews, guides, kitchens — everyone has stitched
              together the same improvised stack. Yuvoy replaces it, and brings
              the travellers to fill it.
            </p>
          </Reveal>
        </div>

        <Reveal className="mt-14">
          <AppStack />
        </Reveal>

        <Reveal>
          <div className="my-8 flex items-center gap-4">
            <span aria-hidden className="bg-cream-line h-px flex-1" />
            <p className="label text-terra-deep">Replaced by</p>
            <span aria-hidden className="bg-cream-line h-px flex-1" />
          </div>
        </Reveal>

        <Reveal>
          <div className="bg-forest text-cream rounded-edge relative overflow-hidden p-8 sm:p-10">
            <div aria-hidden className="grain" />
            <div className="relative flex flex-wrap items-center justify-between gap-8">
              <div className="max-w-xl">
                <h3 className="font-display text-3xl tracking-tight">
                  One place to run it all.
                </h3>
                <p className="text-cream/70 mt-3 leading-relaxed">
                  Listings, calendar, bookings, payments and a season planner —
                  and travellers who arrive ready to pay. Your footage{" "}
                  <em className="italic">is</em> the listing, so there is
                  nothing to write.
                </p>
              </div>
              <Link
                href="#providers"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "focus-visible:ring-offset-forest w-full sm:w-auto",
                )}
              >
                Apply as a founding operator
                <ButtonArrow />
              </Link>
            </div>
          </div>
        </Reveal>

        {/* Real momentum: three signed, one open door. */}
        <Reveal>
          <div className="border-cream-line mt-14 flex flex-wrap items-center gap-x-12 gap-y-8 border-t pt-10">
            <div className="flex items-center gap-5">
              <p className="font-display text-terra text-[clamp(3.5rem,6vw,5rem)] leading-none">
                3
              </p>
              <p className="text-forest/75 max-w-[16ch] text-sm leading-snug">
                <strong className="text-forest block text-base font-semibold">
                  already signed on
                </strong>
                Founding operators for Season One.
              </p>
            </div>
            <ul className="flex min-w-64 flex-1 flex-wrap gap-2.5">
              {SIGNED_SLOTS.map((slot) => (
                <li
                  key={slot.what}
                  className="border-cream-line bg-cream rounded-edge min-w-36 flex-1 border px-4 py-3.5"
                >
                  <p className="text-forest text-sm font-semibold">
                    {slot.what}
                  </p>
                  <p className="text-forest/75 mt-0.5 text-xs">{slot.where}</p>
                </li>
              ))}
              <li className="border-terra-deep/50 rounded-edge min-w-36 flex-1 border border-dashed px-4 py-3.5">
                <p className="text-terra-deep text-sm font-semibold">
                  Your spot
                </p>
                <p className="text-forest/75 mt-0.5 text-xs">
                  Applications open
                </p>
              </li>
            </ul>
          </div>
          <p className="text-forest/75 mt-8 max-w-2xl text-sm leading-relaxed">
            Founding operators join by conversation, not contract — no listing
            fee, and terms agreed with you before anything goes live.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
