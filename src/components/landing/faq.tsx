/**
 * FAQ + responsible safety context. Native <details> — accessible, zero JS,
 * works without hydration.
 */
export function Faq() {
  return (
    <section
      id="faq"
      className="mx-auto max-w-3xl scroll-mt-10 px-6 py-20 sm:px-10"
      aria-labelledby="faq-heading"
    >
      <p className="label text-terra-deep">Questions</p>
      <h2
        id="faq-heading"
        className="font-display text-teal mt-3 text-3xl sm:text-4xl"
      >
        The honest answers.
      </h2>

      <div className="border-cream-line mt-10 divide-y rounded-3xl border">
        {FAQS.map((faq) => (
          <details key={faq.q} className="group px-6 py-5 sm:px-8">
            <summary className="font-display text-teal flex cursor-pointer list-none items-center justify-between gap-4 text-lg marker:content-none">
              {faq.q}
              <span
                aria-hidden
                className="text-terra-deep text-xl transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="text-teal/70 mt-3 text-sm leading-relaxed">{faq.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

const FAQS = [
  {
    q: "What is Yuvoy?",
    a: "A marketplace for real local experiences, being built right now. We connect travellers with the people who actually live a place — starting with water, boats, food and culture in the Andaman Islands, and designed from day one to grow to destinations around the world.",
  },
  {
    q: "Why start in the Andamans?",
    a: "Because the islands hold exactly what we're building for: extraordinary experiences run by locals that most visitors never find. Havelock, Neil and Port Blair are our first destinations — the first market, not the boundary.",
  },
  {
    q: "Can I book something today?",
    a: "Not yet — and we won't pretend otherwise. Registering tells us where you're headed and what draws you; we'll be in touch as experiences open this season. There's no queue position and no payment is taken.",
  },
  {
    q: "What happens after I register?",
    a: "Your details go to a real person on the Yuvoy team. Travellers hear from us as the season takes shape; providers get a conversation about what they offer. We aim to follow up quickly, and your registration is never sold or shared.",
  },
  {
    q: "A word on water activities",
    a: "The sea deserves respect. Experiences involving diving or open water will only ever be listed with operators who run them properly, and we'll always be transparent about what a day requires. We'd rather lose a booking than overstate anyone's readiness.",
  },
];
