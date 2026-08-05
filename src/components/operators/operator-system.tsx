import { SectionHeading } from "@/components/ui/section";
import { buttonVariants, ButtonArrow } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { AppStack } from "@/components/operators/app-stack";

/**
 * The operator case, staged as a transformation: the improvised six-app stack
 * an operator juggles today on the left, the one system that replaces it on
 * the right, and between them a single connector that reads "becomes". Below
 * it, the Season One roster shows real momentum.
 *
 * This lived on the homepage until 2026-08-04. The homepage speaks to
 * travellers now, and everything an operator needs lives on their own page,
 * which the header links to by name.
 *
 * **3 signed founding operators is a true count, confirmed by the owner
 * (2026-08-03).** The three roster cards describe those real signings; the
 * dashed fourth is the invitation. Update these only to match reality.
 */
const CAPABILITIES = [
  "Your footage is the listing. Nothing to write.",
  "Calendar, seats and availability in one place.",
  "Bookings and payments in the same flow.",
  "A planner for the whole season.",
];

const ROSTER = [
  { what: "Dive centre", where: "Havelock" },
  { what: "Sea walk & snorkel", where: "Neil" },
  { what: "Boats & island days", where: "Port Blair" },
];

export function OperatorSystem() {
  return (
    <section
      aria-labelledby="operator-system-heading"
      className="bg-cream border-cream-line border-y"
    >
      <div className="container-page py-20 sm:py-28">
        <div className="grid grid-cols-1 items-end gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionHeading
              id="operator-system-heading"
              eyebrow="What it takes today"
              title="You run a business across"
              accent="six apps."
            />
          </div>
          <p className="text-forest/75 text-lg leading-relaxed lg:col-span-5">
            Dive centres, boat crews, guides, kitchens: everyone has stitched
            together the same improvised stack. Yuvoy replaces it, and brings
            the travellers to fill it.
          </p>
        </div>

        {/* The transformation: today's juggling act becomes one system. */}
        <div className="mt-14 grid grid-cols-1 items-stretch gap-5 lg:grid-cols-[1fr_auto_1fr]">
          <div className="border-cream-line bg-cream-deep rounded-edge flex w-full flex-col border p-7">
            <p className="label text-forest/75">Today: the juggling act</p>
            <div className="mt-6">
              <AppStack />
            </div>
            <p className="text-forest/75 mt-auto pt-6 text-sm leading-relaxed">
              Six logins, none of them talking to each other, and no way for a
              traveller to find you in any of it.
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
              <p className="label text-terra-soft">
                With Yuvoy: one Experience OS
              </p>
              <h3 className="font-display mt-5 text-3xl tracking-tight">
                One place to run it all.
              </h3>
              <ul className="mt-6 flex flex-col gap-3.5">
                {CAPABILITIES.map((capability) => (
                  <li key={capability} className="flex items-start gap-3">
                    <svg
                      aria-hidden
                      viewBox="0 0 20 20"
                      fill="none"
                      className="text-terra-soft mt-1 size-4 shrink-0"
                    >
                      <path
                        d="M4 10.5l4 4 8-8.5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="text-cream/80 text-[15px] leading-relaxed">
                      {capability}
                    </span>
                  </li>
                ))}
              </ul>
              {/* Native anchor, not next/link: a hash-only href pushed
                  through the router uses history.pushState, which does not
                  move the page the way setting location.hash does. */}
              <a
                href="#apply"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "focus-visible:ring-offset-forest mt-8 w-full sm:w-auto",
                )}
              >
                Apply as a founding operator
                <ButtonArrow />
              </a>
            </div>
          </div>
        </div>

        {/* Real momentum: the Season One roster. */}
        <div className="mt-16 flex flex-wrap items-baseline justify-between gap-x-10 gap-y-2">
          <p className="label text-forest/75">Season One roster</p>
          <p className="label text-terra-deep">3 signed · applications open</p>
        </div>
        <ul className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {ROSTER.map((slot) => (
            <li
              key={slot.what}
              className="border-cream-line bg-cream-deep rounded-edge border p-5"
            >
              <p className="label text-terra-deep flex items-center gap-2 text-[9px]">
                <span aria-hidden className="bg-terra size-1" />
                Signed
              </p>
              <p className="text-forest mt-3 text-sm font-bold">{slot.what}</p>
              <p className="text-forest/75 mt-0.5 text-xs">{slot.where}</p>
            </li>
          ))}
          <li className="border-terra-deep/50 rounded-edge border border-dashed p-5">
            <p className="label text-terra-deep text-[9px]">Open</p>
            <p className="text-terra-deep mt-3 text-sm font-bold">Your spot</p>
            <p className="text-forest/75 mt-0.5 text-xs">Applications open</p>
          </li>
        </ul>
        <p className="text-forest/75 mt-8 max-w-2xl text-sm leading-relaxed">
          Founding operators join by conversation, not contract: no listing fee,
          and terms agreed with you before anything goes live.
        </p>
      </div>
    </section>
  );
}
