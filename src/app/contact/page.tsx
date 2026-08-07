import type { Metadata } from "next";
import { PageIntro } from "@/components/site/page-intro";
import { Section } from "@/components/ui/section";
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
 * answer to any of them except a waitlist form, which asks rather than
 * offers. People look for "Contact", not for a section inside About, so it is
 * a route.
 *
 * ## The order on the page is the order of usefulness
 *
 * The two live channels come first and the form comes second, which is the
 * reverse of the reference this was modelled on. That is deliberate while the
 * form is disabled — but it is the right order afterwards too: email and
 * WhatsApp reach a person now, and a form is a slower way to do the same
 * thing. A visitor should not have to scroll past something that cannot help
 * them to find something that can.
 *
 * The homepage carries a glance at this (`ContactGlance`), not a copy of it.
 */
const CONTENTS = [
  { href: "#channels", label: "Reach us directly" },
  { href: "#message", label: "Leave a note" },
];

export default function ContactPage() {
  return (
    <main>
      <PageIntro
        eyebrow="Contact"
        title="Not sure where to start?"
        accent="Here."
        lede="Ask us anything about Yuvoy, tell us what you think, or start a conversation about listing what you run."
        contents={CONTENTS}
      />

      <Section id="channels" aria-labelledby="channels-heading">
        <div className="max-w-3xl">
          <p className="eyebrow text-terra-deep">Reach us directly</p>
          <h2
            id="channels-heading"
            className="font-display tracking-display mt-6 text-[clamp(2.125rem,5vw,3.375rem)] leading-[1.04] font-normal text-balance"
          >
            A person reads{" "}
            <em className="text-terra font-turn italic">every message.</em>
          </h2>
          {/*
            No response-time promise, here or anywhere (owner direction). A
            window this team will eventually miss costs more trust than one
            never offered, which is the same rule that keeps launch months off
            the rest of the site.
          */}
          <ContactChannels className="mt-12" />
        </div>
      </Section>

      <Section tone="ink" id="message" aria-labelledby="message-heading">
        <MessageForm />
      </Section>
    </main>
  );
}
