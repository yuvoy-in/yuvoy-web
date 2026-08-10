import type { Metadata } from "next";
import { ContactChannels } from "@/components/site/contact-channels";
import { MessageForm } from "@/components/site/message-form";

export const metadata: Metadata = {
  title: "Contact Yuvoy",
  description:
    "Reach Yuvoy by email or WhatsApp. General enquiries, feedback, listing your business, and partnerships.",
  alternates: { canonical: "/contact" },
};

/**
 * `/contact` — the page that says a person is on the other end.
 *
 * ## Why this exists as its own route
 *
 * A pre-launch product collects questions: what is this, when does it open,
 * can I list my business, is this real. Before 2026-08-07 the site had no
 * answer to any of them except a waitlist form, which asks rather than offers.
 * People look for "Contact", not for a section inside About, so it is a route.
 *
 * ## One act, not three (owner direction, 2026-08-08)
 *
 * It used to run as a title spread, then "Reach us directly" on cream, then
 * "Leave a note" on forest — three full-height sections for a page that says
 * one thing. Each was correctly built and the page still read as empty,
 * because the content was spread thin across a scroll that kept promising
 * something more was coming. A title spread with an index of two links is an
 * index nobody needs.
 *
 * They are now a single forest act: the address and the number on the left,
 * the form on the right, and the footer under it. The page ends where it
 * stops being useful, which is the point at which somebody has either written
 * to us or tapped a link.
 *
 * ## The order within it is the order of usefulness
 *
 * The two live channels come first — on a phone they are what a visitor
 * reaches first, and they reach a person *now*. The form is the slower way to
 * do the same thing, so it sits beside them on a wide screen and beneath them
 * on a narrow one. Nobody should have to scroll past the slow option to find
 * the fast one.
 *
 * ## The surface
 *
 * Forest, and the page's own cover — `data-dark-hero` and the `-mt-16` pull-up
 * that lets the header go transparent over it, exactly as `PageIntro` does for
 * the other interior pages. `/contact` is already in `isCoverRoute`, so the
 * server and the first paint agree; **if this section ever stops being dark,
 * remove it from that list in the same change.**
 *
 * The homepage carries a glance at this (`ContactGlance`), not a copy of it,
 * and the footer's closing waitlist call to action does not run here — the
 * page is a conversation, not a conversion (see `showsFooterCta`).
 */
export default function ContactPage() {
  return (
    <main>
      <section
        data-dark-hero
        id="contact"
        aria-labelledby="contact-heading"
        className="bg-forest text-cream relative -mt-16 overflow-hidden"
      >
        {/* The field: the same breathing lagoon light and filmic grain the
            homepage cover uses, without its photography. Decorative, inert. */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="hero-atmosphere" />
          <div className="grain" />
        </div>

        <div className="container-page relative pt-32 pb-20 sm:pt-36 sm:pb-28">
          <div className="grid grid-cols-1 gap-x-16 gap-y-16 lg:grid-cols-2 lg:gap-x-20">
            <div>
              <p className="eyebrow text-terra-soft">Contact</p>
              <h1
                id="contact-heading"
                className="font-display tracking-display mt-6 max-w-xl text-[clamp(2.5rem,6vw,4rem)] leading-[1.02] font-normal text-balance"
              >
                Not sure where to start?{" "}
                <em className="text-terra-soft font-turn italic">Here.</em>
              </h1>
              <p className="text-cream/75 mt-8 max-w-md text-lg leading-relaxed">
                Ask us anything about Yuvoy, tell us what you think, or start a
                conversation about listing what you run.
              </p>

              {/*
                `#channels` keeps its id: it was the second entry in the page
                index this act replaced, and an anchor that has been published
                is a contract even when the section around it changes shape.

                No response-time promise, here or anywhere (owner direction). A
                window this team will eventually miss costs more trust than one
                never offered, which is the same rule that keeps launch months
                off the rest of the site.
              */}
              <h2
                id="channels"
                className="label text-cream/70 mt-14 scroll-mt-[calc(6rem+env(safe-area-inset-top))]"
              >
                Reach us directly
              </h2>
              <ContactChannels tone="ink" className="mt-6" />
            </div>

            <div
              id="message"
              className="scroll-mt-[calc(6rem+env(safe-area-inset-top))]"
            >
              <MessageForm />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
