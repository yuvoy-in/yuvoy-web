import type { Metadata } from "next";
import { PageIntro } from "@/components/site/page-intro";
import { Section, SectionHeading } from "@/components/ui/section";
import { StatusNotice } from "@/components/site/status-notice";
import { Wordmark } from "@/components/brand/wordmark";

export const metadata: Metadata = {
  // Absolute: "About · Yuvoy" from the template reads as a section label,
  // and "About Yuvoy · Yuvoy" is worse. This is the title the brief asks for.
  title: { absolute: "About Yuvoy" },
  description:
    "Yuvoy connects people with real-world experiences and the people who run them. What it is, why it exists, and why it is opening first in the Andaman Islands.",
  alternates: { canonical: "/about" },
};

/**
 * About Yuvoy.
 *
 * **This is the company's story, not a personal founder biography**, and that
 * is deliberate: the brand documents contain no founder names, background or
 * biography, and inventing a person is exactly the class of fabrication this
 * rebuild exists to undo. A personal section is a paragraph away once the
 * owner supplies it (issue #48).
 *
 * ## The 2026-08-06 simplification
 *
 * The page opened by explaining the name. That is a charming fact and a poor
 * first sentence: a visitor who has just arrived wants to know what this is,
 * not what it is called. The etymology is still here, as a brand note near the
 * foot, at the size it deserves.
 *
 * Four principles became three, and the "not open yet" section — four
 * paragraphs enumerating what has not been built — became one status panel.
 * Neither change removes a fact; both remove a second telling of one.
 */
const CONTENTS = [
  { href: "#what", label: "What Yuvoy is" },
  { href: "#why", label: "Why it exists" },
  { href: "#andaman", label: "Why Andaman first" },
  { href: "#status", label: "Where we are" },
];

const PRINCIPLES = [
  {
    title: "Show the real experience",
    body: "Use honest footage from the people running it.",
  },
  {
    title: "Make expectations clear",
    body: "Tell people what the day involves before they commit.",
  },
  {
    title: "Build around operators",
    body: "Create tools that support how experiences work in the real world.",
  },
];

export default function AboutPage() {
  return (
    <main>
      <PageIntro
        eyebrow="About Yuvoy"
        title="Built to help people"
        accent="experience more of a place."
        lede="Yuvoy connects people with real-world experiences and the people who run them."
        contents={CONTENTS}
      />

      <Section id="what" aria-labelledby="what-heading">
        <SectionHeading
          id="what-heading"
          eyebrow="What Yuvoy is"
          title="One place to discover and book"
          accent="real experiences."
          body="For travellers, Yuvoy makes it easier to see what an experience is really like before choosing it. For operators, it brings discovery, availability and bookings into one place."
        />

        {/*
          Traveller ↔ Yuvoy ↔ operator, drawn as three terms on one line
          rather than as a diagram of boxes and arrows. Both sides are real
          content; the connectors are the only decoration and are hidden from
          assistive tech, so the relationship reads as three things rather
          than as punctuation.
        */}
        <div className="border-cream-line mt-14 grid grid-cols-1 items-center gap-6 border-t pt-10 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:gap-4">
          <div>
            <p className="label text-forest/75">Traveller</p>
            <p className="text-forest/75 mt-3 leading-relaxed">
              Sees the experience before choosing it.
            </p>
          </div>
          <span
            aria-hidden
            className="bg-cream-line h-px w-10 justify-self-center sm:w-full sm:min-w-8"
          />
          {/* The lockup itself, not the name set in display type. This is the
              one place on the site where Yuvoy is named *as a party* between
              two others, so it should be the mark rather than a word — and
              the mark already carries the name, the ensō and the tagline as
              one drawing (design system §2). */}
          <div className="flex justify-center sm:px-2">
            <Wordmark className="h-14 sm:h-16" />
          </div>
          <span
            aria-hidden
            className="bg-cream-line h-px w-10 justify-self-center sm:w-full sm:min-w-8"
          />
          <div className="sm:text-right">
            <p className="label text-forest/75">Operator</p>
            <p className="text-forest/75 mt-3 leading-relaxed">
              Shows what they run, and manages it in one place.
            </p>
          </div>
        </div>
      </Section>

      <Section tone="ink" id="why" aria-labelledby="why-heading">
        <SectionHeading
          id="why-heading"
          tone="ink"
          eyebrow="Why it exists"
          title="The experience is real."
          accent="Finding it is the hard part."
        />
        <div className="border-cream/12 mt-14 grid grid-cols-1 gap-x-16 gap-y-10 border-t pt-10 sm:grid-cols-2">
          <div>
            <h3 className="font-display tracking-display text-xl leading-snug font-normal">
              For travellers
            </h3>
            <p className="text-cream/70 mt-3 leading-relaxed">
              Good experiences are scattered across social media, messages,
              local counters and booking sites.
            </p>
          </div>
          <div>
            <h3 className="font-display tracking-display text-xl leading-snug font-normal">
              For operators
            </h3>
            <p className="text-cream/70 mt-3 leading-relaxed">
              The people running them manage marketing, enquiries, schedules and
              payments across disconnected tools.
            </p>
          </div>
        </div>
        <p className="font-display tracking-display mt-14 text-2xl leading-snug font-normal text-balance sm:text-3xl">
          Yuvoy is being built to make{" "}
          <em className="text-terra-soft font-turn italic">
            both sides simpler.
          </em>
        </p>
      </Section>

      <Section id="andaman" aria-labelledby="andaman-heading">
        <SectionHeading
          id="andaman-heading"
          eyebrow="Why Andaman first"
          title="Starting close to"
          accent="the experience."
          body={
            <>
              <p>
                Yuvoy is opening first in the Andaman Islands, where experiences
                depend on real operators, changing conditions and local
                knowledge. It is the first launch, not the limit of the
                platform.
              </p>
              <p className="mt-4">
                It is also built around an established diving operation in
                Havelock: its own boats, its own crew, and years of guests
                behind it. Almost everything hard about this business is
                operational rather than technical, and you cannot design for
                weather, capacity and readiness from a distance.
              </p>
            </>
          }
        />

        <div className="border-cream-line mt-16 border-t pt-10">
          <p className="label text-forest/75">Principles</p>
          <ul className="mt-8 grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-3">
            {PRINCIPLES.map((principle) => (
              <li key={principle.title}>
                <h2 className="font-display text-forest tracking-display text-xl leading-snug font-normal">
                  {principle.title}
                </h2>
                <p className="text-forest/75 mt-3 leading-relaxed">
                  {principle.body}
                </p>
              </li>
            ))}
          </ul>

          {/* The brand note, at the size it deserves. It opened the page
              until 2026-08-06, where it answered a question nobody had asked
              yet. */}
          <p className="text-forest/75 mt-14 max-w-md text-sm leading-relaxed">
            Yuvoy combines &ldquo;you&rdquo; and &ldquo;voyage&rdquo;: a journey
            shaped around what you want to experience.
          </p>
        </div>
      </Section>

      <Section tone="ink" id="status" aria-labelledby="status-heading">
        <SectionHeading
          id="status-heading"
          tone="ink"
          eyebrow="Where we are"
          title="Preparing the"
          accent="first launch."
        />
        <StatusNotice tone="ink" className="mt-10">
          <p>
            Yuvoy is currently preparing its first launch. The traveller
            waitlist and founding-operator applications are open. Nothing on the
            site is bookable yet.
          </p>
        </StatusNotice>
        {/*
          No call to action here (owner direction, 2026-08-07). The page
          carried "Join the waitlist" in this section and met the footer's
          standing "Be first to experience Yuvoy" a screen later, which is the
          same ask twice inside one scroll. The header carries it on every
          route, and this is the About page: its job is to explain the company,
          not to convert. The status above is the honest close.
        */}
      </Section>
    </main>
  );
}
