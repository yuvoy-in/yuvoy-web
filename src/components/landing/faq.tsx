import { Section, SectionHeading } from "@/components/ui/section";

/**
 * FAQ. Native `<details>` — accessible, zero JS, works without hydration.
 *
 * The answers are the honest ones, including the uncomfortable one ("Can I
 * book something today?" — no). Copy is aligned to the waitlist language the
 * rest of the site now uses.
 */
export function Faq() {
  return (
    <Section id="faq" aria-labelledby="faq-heading">
      <SectionHeading
        id="faq-heading"
        eyebrow="Questions"
        title="Asked and"
        accent="answered."
      />

      <div className="border-cream-line mt-14 border-t">
        {FAQS.map((faq) => (
          <details key={faq.q} className="group border-cream-line border-b">
            <summary className="font-display text-teal flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-lg font-bold tracking-tight marker:content-none">
              {faq.q}
              <span
                aria-hidden
                className="text-terra-deep shrink-0 text-2xl leading-none transition-transform duration-200 group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="text-teal/75 max-w-3xl pb-6 leading-relaxed">
              {faq.a}
            </p>
          </details>
        ))}
      </div>
    </Section>
  );
}

const FAQS = [
  {
    q: "What exactly is Yuvoy?",
    a: "A marketplace for real local experiences, being built right now. We connect travellers with the people who actually live a place — starting with water, boats, food and culture in the Andaman Islands, and designed from day one to grow to destinations elsewhere.",
  },
  {
    q: "Why the Andaman Islands first?",
    a: "Because the islands hold exactly what we're building for: extraordinary experiences run by locals that most visitors never find. Havelock, Neil and Port Blair are our first destinations — the first market, not the boundary.",
  },
  {
    q: "Can I book something today?",
    a: "No — and we won't pretend otherwise. Joining the waitlist tells us where you're headed and what draws you; we'll message you as experiences open. There's no queue position and no payment is taken.",
  },
  {
    q: "What happens after I join the waitlist?",
    a: "Your details go to a real person on the Yuvoy team. Travellers hear from us as the season takes shape; operators get a conversation about what they offer. Your details are never sold or shared.",
  },
  {
    q: "A word on water activities",
    a: "The sea deserves respect. Experiences involving diving or open water will only ever be listed with operators who run them properly, and we'll always be transparent about what a day requires. We'd rather lose a booking than overstate anyone's readiness.",
  },
];
