import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/site/page-header";
import { Section, SectionHeading } from "@/components/ui/section";
import { buttonVariants, ButtonArrow } from "@/components/ui/button";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "About",
  description:
    "What Yuvoy is, what the name means, what we stand for, and why it starts from a dive operation in Havelock rather than from a spreadsheet.",
  alternates: { canonical: "/about" },
};

/**
 * About Yuvoy.
 *
 * **This is the company's story, not a personal founder biography**, and that
 * is deliberate: the brand documents contain no founder names, background or
 * biography, and inventing a person is exactly the class of fabrication this
 * rebuild exists to undo.
 *
 * Everything here is drawn from the owner's own brand and business documents:
 * the meaning of the name, the sonder idea, the four principles, and the fact
 * that Yuvoy is built around an established diving operation in Havelock.
 *
 * A personal section — who started it, and why — is a paragraph away once the
 * owner supplies it. See issue #48.
 */
const PRINCIPLES = [
  {
    title: "Participant, not spectator",
    body: "You join the life of a place rather than watch it from the sidelines. That is the difference we are actually selling, and it is the hardest thing to fake.",
  },
  {
    title: "The place as it actually is",
    body: "Honest and rooted, never the brochure version. If a day is hard, or wet, or starts at five in the morning, that is what we will tell you.",
  },
  {
    title: "Premium through intimacy and craft",
    body: "Quiet, considered and personal, not flashy. Small numbers of people, run properly, beats volume every time.",
  },
  {
    title: "Earned, not borrowed",
    body: "We tell stories from a place we genuinely operate in. It is why we are starting with three islands instead of a world map.",
  },
];

export default function AboutPage() {
  return (
    <main>
      <PageHeader
        eyebrow="About"
        title="You, plus voyage."
        accent="That is the whole idea."
        lede={
          <>
            <p>
              Yuvoy, <em className="not-italic">yoo-voy</em>, is built from two
              words: <strong className="text-forest font-bold">you</strong> and{" "}
              <strong className="text-forest font-bold">voyage</strong>. It is a
              platform for finding and booking real-world experiences, opening
              first in the Andaman Islands.
            </p>
            <p className="mt-4">
              The idea underneath it is one most people have felt without
              naming: that everybody around you is living a life as full and as
              vivid as your own. A place you are visiting is somewhere other
              people work, eat and belong. We would rather help you step into
              that for a day than watch it go past a window.
            </p>
          </>
        }
      />

      <Section aria-labelledby="foundation-heading">
        <SectionHeading
          id="foundation-heading"
          eyebrow="Where it comes from"
          title="It starts from a dive boat,"
          accent="not a spreadsheet."
          body={
            <>
              <p>
                Yuvoy is built around an established diving operation in
                Havelock: its own boats, its own crew, and years of guests
                already behind it. That is the foundation the rest is being
                built on.
              </p>
              <p className="mt-4">
                It matters because almost everything hard about this business is
                operational rather than technical. Weather cancels days. Boats
                have capacity. Guests overestimate what they are ready for. You
                cannot design for any of that from a distance, and we are not
                trying to.
              </p>
            </>
          }
        />
      </Section>

      <Section tone="ink" aria-labelledby="problem-heading">
        <SectionHeading
          id="problem-heading"
          tone="ink"
          eyebrow="What we are fixing"
          title="The supply is real."
          accent="The way you find it is broken."
          body={
            <>
              <p>
                Experiences are the fastest-growing thing people spend on, and
                they are still arranged through posters, brokers and long
                WhatsApp threads. Meanwhile the people running them juggle
                Instagram for marketing, a notebook for bookings and a calendar
                that only exists in someone&rsquo;s head.
              </p>
              <p className="mt-4">
                Both sides lose. Travellers cannot see what a day is really like
                before committing. Operators spend their time on admin instead
                of on the water.
              </p>
              <p className="mt-4">
                Yuvoy is being built as one place where an experience is shown
                honestly in video, booked in the same motion, and run on tools
                that do not fight the person using them.
              </p>
            </>
          }
        />
      </Section>

      <Section aria-labelledby="principles-heading">
        <SectionHeading
          id="principles-heading"
          eyebrow="What we stand for"
          title="Four things we will not"
          accent="trade away."
        />
        <ul className="border-cream-line mt-14 grid grid-cols-1 gap-px border-t sm:grid-cols-2">
          {PRINCIPLES.map((principle, i) => (
            <li key={principle.title} className="pt-10 sm:pr-10">
              <span className="label text-forest/75">0{i + 1}</span>
              <h3 className="font-display text-forest mt-5 text-xl font-medium tracking-tight">
                {principle.title}
              </h3>
              <p className="text-forest/75 mt-3 leading-relaxed">
                {principle.body}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="ink" aria-labelledby="where-heading">
        <SectionHeading
          id="where-heading"
          tone="ink"
          eyebrow="Where we are"
          title="Not open yet,"
          accent="and saying so."
          body={
            <>
              <p>
                There is nothing to book on Yuvoy today. No prices, no
                availability, no listings. The site says that on every page it
                comes up, because the alternative, implying a product that does
                not exist, is how trust gets spent before it is earned.
              </p>
              <p className="mt-4">
                What is open is the waitlist, and the door for operators who
                want a say in how this gets built.
              </p>
            </>
          }
        />
        <div className="mt-12 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/waitlist"
            className={cn(
              buttonVariants({ size: "lg" }),
              "focus-visible:ring-offset-forest w-full sm:w-auto",
            )}
          >
            Join the waitlist
            <ButtonArrow />
          </Link>
          <Link
            href="/waitlist?audience=provider"
            className={cn(
              buttonVariants({ variant: "outlineOnDark", size: "lg" }),
              "w-full sm:w-auto",
            )}
          >
            Apply as a founding operator
          </Link>
        </div>
      </Section>
    </main>
  );
}
