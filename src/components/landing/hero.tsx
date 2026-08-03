import { buttonVariants, ButtonArrow } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { PhonePreview } from "@/components/landing/phone-preview";

/**
 * The cover. Thesis on the left, the product running live on the right —
 * nobody should have to scroll three sections to see the thing, so the
 * Season One preview sits on the cover itself.
 *
 * The facts row along the bottom is the page's momentum line and every entry
 * on it must be literally true today. "3 founding operators signed" is a real
 * count confirmed by the owner (2026-08-03); update it only to another true
 * number.
 */
const FACTS = [
  "Waitlist open",
  "No payment required",
  "3 founding operators signed",
];

export function Hero() {
  return (
    <section className="bg-forest text-cream relative overflow-hidden">
      {/* Ambient light — a terracotta dawn high in the frame, depth below. */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="from-terra/15 absolute -top-1/4 left-1/2 h-[70vh] w-[130vw] -translate-x-1/2 rounded-b-full bg-radial to-transparent to-70% blur-3xl" />
        <div className="grain" />
      </div>

      <div className="container-page relative flex min-h-[calc(100dvh-4rem)] flex-col justify-center py-16 sm:py-20">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-20">
          <div>
            <p
              className="eyebrow text-terra-soft rise"
              style={{ animationDelay: "0.05s" }}
            >
              Season One · Andaman Islands · October 2026
            </p>

            <h1
              className="font-display rise mt-8 max-w-3xl text-[clamp(2.75rem,7.5vw,5.25rem)] leading-[0.98] font-normal tracking-tight"
              style={{ animationDelay: "0.15s" }}
            >
              Every trip starts with one question.
              <span className="text-terra-soft mt-3 block italic">
                &ldquo;What should I do?&rdquo;
              </span>
            </h1>

            <p
              className="text-cream/70 rise mt-8 max-w-xl text-lg leading-relaxed"
              style={{ animationDelay: "0.3s" }}
            >
              Yuvoy answers it. Everything a place actually offers — on honest
              video from the people who run it — booked in the same scroll.
            </p>

            <div
              className="rise mt-10 flex flex-col gap-3 sm:flex-row"
              style={{ animationDelay: "0.45s" }}
            >
              {/*
                Native anchors, not next/link: hash-only hrefs pushed through
                the router use history.pushState, which never fires the
                hashchange event LeadForms listens on. A plain anchor sets
                location.hash natively, which both scrolls and fires it.
              */}
              <a
                href="#register"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "focus-visible:ring-offset-forest w-full sm:w-auto",
                )}
              >
                Join the waitlist
                <ButtonArrow />
              </a>
              <a
                href="#how"
                className={cn(
                  buttonVariants({ variant: "outlineOnDark", size: "lg" }),
                  "focus-visible:ring-offset-forest w-full sm:w-auto",
                )}
              >
                How it works
              </a>
            </div>

            {/* Scroll cue — a falling thread. */}
            <div
              aria-hidden
              className="rise mt-14 hidden items-center gap-3 lg:flex"
              style={{ animationDelay: "0.6s" }}
            >
              <span className="bg-terra/60 cue-line block h-9 w-px" />
              <span className="label text-cream/70">Scroll</span>
            </div>
          </div>

          <div
            className="rise justify-self-center"
            style={{ animationDelay: "0.35s" }}
          >
            <PhonePreview />
          </div>
        </div>

        {/* The momentum line — three true facts, and the three islands. */}
        <div
          className="rise border-cream/12 mt-16 flex flex-wrap items-center justify-between gap-x-10 gap-y-3 border-t pt-6"
          style={{ animationDelay: "0.7s" }}
        >
          <ul className="flex flex-wrap items-center gap-x-8 gap-y-2">
            {FACTS.map((fact) => (
              <li
                key={fact}
                className="label text-cream/70 flex items-center gap-2.5"
              >
                <span aria-hidden className="bg-terra size-1 shrink-0" />
                {fact}
              </li>
            ))}
          </ul>
          <p className="label text-cream/70">Havelock · Neil · Port Blair</p>
        </div>
      </div>
    </section>
  );
}
