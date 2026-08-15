import type { Metadata } from "next";
import Image from "next/image";
import { ContactAssurances } from "@/components/site/contact-assurances";
import { ContactChannels } from "@/components/site/contact-channels";
import { MessageForm } from "@/components/site/message-form";
import { VIEWPORT_ON_FOREST } from "@/lib/site/theme";

/** This route opens on a forest cover; Safari's top glass follows
    theme-color, so the chrome must agree with it (see lib/site/theme). */
export const viewport = VIEWPORT_ON_FOREST;

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
 * Forest, and the page's own cover — `data-dark-hero` and the pull-up that
 * lets the header go transparent over it, exactly as `PageIntro` does for the
 * other interior pages. `/contact` is already in `isCoverRoute`, so the server
 * and the first paint agree; **if this section ever stops being dark, remove
 * it from that list in the same change.**
 *
 * The pull-up and the padding that puts the content back are
 * `calc(4rem + env(safe-area-inset-top))` and its `6rem`/`9rem` counterparts,
 * matching `Hero` and `PageIntro` (DESIGN_SYSTEM §4). This route was left on
 * the flat `-mt-16`/`pt-32` when the header moved to 64px plus the inset —
 * only its `scroll-mt` was carried over — so it was the one cover measuring
 * the bar differently from the other two. The `env()` reads 0 in Safari today
 * (`viewport-fit=cover` is banned, and why is in §4); it is here for the same
 * reason it is on the other two, which is that it costs nothing at zero and
 * is right the day the site is opened from a home screen.
 *
 * ## The field (owner artwork + direction, 2026-08-11)
 *
 * It used to be the lagoon light alone. It is now the owner's moody bay merged
 * into that light the same way the homepage cover merges its seascape — photo,
 * forest multiply, scrim, atmosphere, grain — with one layer the cover never
 * needed: a lateral falloff that deepens the field toward the side the note
 * card lands on. The bay's palm and its horizon glow sit on the left, which is
 * the side the headline reads from, and the right half stays quiet enough for
 * a form to be filled in on.
 *
 * At the top edge the scrim still resolves to near-solid forest, because the
 * transparent header has to meet flat green rather than a photograph. That is
 * the same constraint the cover works under and the reason neither section may
 * simply drop an image behind itself.
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
        className="bg-forest text-cream relative -mt-[calc(4rem+env(safe-area-inset-top))] overflow-hidden"
      >
        {/* The field, in six layers. All decorative, all inert. */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <Image
            src="/photography/contact-bay.webp"
            alt=""
            fill
            // `priority`: this is the page's cover art, above the fold on
            // every viewport, and the LCP candidate on a phone. 75 is the
            // photography quality the optimiser's allowlist permits.
            priority
            quality={75}
            sizes="100vw"
            /*
              22%, not centre. The bay is a 1.74 frame and this act is nearer
              1.3, so `cover` crops several hundred pixels off the sides — at
              centre that cut lands squarely through the palm at the left edge,
              which is the one thing in the photograph that reads as a place
              rather than as weather. Biasing the crop left keeps it whole and
              still holds the islands and the boat in frame on a wide screen.
            */
            className="hero-photo object-cover object-[22%_center]"
          />
          <div className="bg-forest/25 absolute inset-0 mix-blend-multiply" />
          <div className="contact-scrim absolute inset-0" />
          {/* Only where the two-column layout exists — see the utility. */}
          <div className="contact-scrim-lateral absolute inset-0 hidden lg:block" />
          <div className="hero-atmosphere" />
          <div className="grain" />
        </div>

        <div className="container-page relative pt-[calc(6rem+env(safe-area-inset-top))] pb-20 sm:pt-[calc(9rem+env(safe-area-inset-top))] sm:pb-24">
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

                A drawn terracotta horizon sat between the lede and this label
                until 2026-08-12 (owner direction: taken out). Space does the
                separating now, which is why the margin here is `mt-16` rather
                than the `mt-12` it carried while a mark was doing the work.
              */}
              <h2
                id="channels"
                className="label text-cream/70 mt-16 scroll-mt-[calc(6rem+env(safe-area-inset-top))]"
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

          {/*
            The closing strip: four standing facts about how these channels are
            run, under both columns rather than inside either. It answers the
            question a form leaves behind (who is going to see this?) and it is
            the last thing on the page, because after it there is nothing left
            to say that the footer does not.
          */}
          <ContactAssurances className="mt-16 sm:mt-20" />
        </div>
      </section>
    </main>
  );
}
