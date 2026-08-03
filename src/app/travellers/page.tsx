import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/site/page-header";
import { Section, SectionHeading } from "@/components/ui/section";
import { buttonVariants, ButtonArrow } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { DESTINATIONS } from "@/lib/site/destinations";

export const metadata: Metadata = {
  title: "For travellers",
  description:
    "What joining the Yuvoy waitlist actually gets you, what does not exist yet, and why we would rather tell you now than at the jetty.",
  alternates: { canonical: "/travellers" },
};

/**
 * The traveller value page.
 *
 * Its job is to be trusted, not to be persuasive. The hesitations section
 * states the three things a sceptical visitor is actually thinking — there is
 * nothing to book, there are no prices, and this might be another dead
 * waitlist — and answers them without softening any of them.
 */
const GETS = [
  {
    title: "First access when the season opens",
    body: "Waitlist members hear from us before the site opens to everyone. That is the whole of the advantage — there is no queue position and nothing to buy.",
  },
  {
    title: "Days chosen for you, not listed at you",
    body: "Tell us which island you are headed to and what draws you, and the first things we send are the ones that fit.",
  },
  {
    title: "A person, not an autoresponder",
    body: "Someone on the team reads what you send. Your details are never sold or shared, and you can ask us to delete them at any point.",
  },
];

const HESITATIONS = [
  {
    q: "There is nothing to book — so what am I joining?",
    a: "A list of people we will message when the first Andaman experiences are ready. That is deliberately unglamorous. Booking, payment and availability are not built, and we are not going to imply otherwise to make a signup feel bigger than it is.",
  },
  {
    q: "Why are there no prices anywhere?",
    a: "Because there are no agreed prices yet. Publishing indicative numbers before operators have set them would make this page look more finished and make us less trustworthy. Prices appear when they are real and the operator has set them.",
  },
  {
    q: "How do I know this is not another abandoned waitlist?",
    a: "You do not, yet — and no badge on this page could prove it. What we can do is not overstate where we are. Everything on this site is marked as either open now or planned, and today only two things are open: joining as a traveller, and applying as an operator.",
  },
];

export default function TravellersPage() {
  return (
    <main>
      <PageHeader
        eyebrow="For travellers"
        title="Know what you are getting"
        accent="before you are on the boat."
        lede="The Andamans are extraordinary and largely offline, which today means asking at counters and hoping. Yuvoy is being built so that the day you pick is the day you get."
      >
        <Link
          href="/waitlist"
          className={cn(
            buttonVariants({ size: "lg" }),
            "flex w-full sm:inline-flex sm:w-auto",
          )}
        >
          Join the traveller waitlist
          <ButtonArrow />
        </Link>
      </PageHeader>

      <Section aria-labelledby="gets-heading">
        <SectionHeading
          id="gets-heading"
          eyebrow="What joining gets you"
          title="Three things,"
          accent="and not a fourth."
        />
        <ul className="border-cream-line mt-14 grid grid-cols-1 gap-px border-t md:grid-cols-3">
          {GETS.map((item, i) => (
            <li key={item.title} className="pt-10 md:pr-8">
              <span className="label text-forest/75">0{i + 1}</span>
              <h3 className="font-display text-forest mt-5 text-xl font-bold tracking-tight">
                {item.title}
              </h3>
              <p className="text-forest/75 mt-3 leading-relaxed">{item.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="ink" aria-labelledby="hesitations-heading">
        <SectionHeading
          id="hesitations-heading"
          tone="ink"
          eyebrow="The fair questions"
          title="What you are probably"
          accent="thinking."
        />
        <dl className="border-cream/12 mt-14 border-t">
          {HESITATIONS.map((item) => (
            <div key={item.q} className="border-cream/12 border-b py-8">
              <dt className="font-display text-xl font-bold tracking-tight">
                {item.q}
              </dt>
              <dd className="text-cream/70 mt-3 max-w-3xl leading-relaxed">
                {item.a}
              </dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section aria-labelledby="where-heading">
        <SectionHeading
          id="where-heading"
          eyebrow="Where"
          title="Three islands"
          accent="to begin with."
          body="Pick the one you are headed to when you join, and we will start there."
        />
        <ul className="border-cream-line mt-14 grid grid-cols-1 gap-px border-t md:grid-cols-3">
          {DESTINATIONS.map((destination) => (
            <li key={destination.key} className="pt-10 md:pr-8">
              <h3 className="font-display text-forest text-xl font-bold tracking-tight">
                {destination.shortLabel}
              </h3>
              <p className="label text-forest/75 mt-2">{destination.label}</p>
              <p className="text-forest/75 mt-4 leading-relaxed">
                {destination.blurb}
              </p>
            </li>
          ))}
        </ul>
      </Section>
    </main>
  );
}
