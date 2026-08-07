import Link from "next/link";
import { CONTACT_CHANNEL_LIST } from "@/lib/site/contact";

/**
 * The homepage's glance at contact: a band, never the form.
 *
 * ## Why this is three lines and not a section
 *
 * The whole point of the placement decision (owner direction, 2026-08-07) is
 * that a visitor should *know* they can reach a person without being handed a
 * form they did not ask for. A full contact block competes with the one thing
 * the page is actually asking for — the waitlist, or the application — and two
 * asks in a row is how both get ignored.
 *
 * It closes the homepage and `/operators`, which is why it lives in `site/`
 * rather than `landing/`: both pages end in an ask, and the person who did
 * not take it is exactly the person with a question.
 *
 * So this states that help exists, gives the two channels as real links for
 * anyone who wants to act immediately, and points at `/contact` for anyone
 * who wants the form. It sits directly above the footer, which is where a
 * reader who has finished the page and still has a question is looking.
 *
 * The channels come from `CONTACT_CHANNEL_LIST`, so the address and the
 * number exist in one place and cannot drift between here, `/contact` and the
 * footer.
 *
 * No top rule: this cream band sits between the forest registration block and
 * the forest footer, so both of its joins are already tone changes.
 */
export function ContactGlance() {
  return (
    <section
      aria-labelledby="contact-glance-heading"
      className="bg-cream text-forest"
    >
      <div className="container-page py-16 sm:py-20">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          <div className="max-w-xl">
            <p className="eyebrow text-terra-deep">Questions</p>
            <h2
              id="contact-glance-heading"
              className="font-display tracking-display mt-5 text-[clamp(1.75rem,3.5vw,2.5rem)] leading-tight text-balance"
            >
              Not sure where to start?{" "}
              <em className="text-terra font-turn italic">Ask us.</em>
            </h2>
            <p className="text-forest/75 mt-5 leading-relaxed">
              A person reads every message. Email or WhatsApp reaches us
              directly.
            </p>
          </div>

          {/* The channels as a compact row, and one way through to the page
              that carries the form. `flex-none` so the block keeps its shape
              beside the statement rather than being squeezed by it. */}
          <div className="flex flex-none flex-col gap-3">
            {CONTACT_CHANNEL_LIST.map((channel) => (
              <a
                key={channel.key}
                href={channel.href}
                {...(channel.href.startsWith("http")
                  ? { rel: "noopener noreferrer" }
                  : {})}
                className="group text-forest hover:text-terra-deep focus-visible:ring-terra-deep rounded-edge flex items-baseline gap-4 transition-colors duration-200 focus-visible:ring-2 focus-visible:outline-none"
              >
                <span className="label text-forest/75 w-20 flex-none">
                  {channel.label}
                </span>
                <span className="font-display tracking-display text-lg leading-snug font-normal underline-offset-4 group-hover:underline sm:text-xl">
                  {channel.value}
                </span>
              </a>
            ))}
            <Link
              href="/contact"
              className="label tap-target text-terra-deep hover:text-forest mt-2 underline underline-offset-4 transition-colors duration-200"
            >
              Or leave a note
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
