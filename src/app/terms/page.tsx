import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/site/legal-page";

export const metadata: Metadata = {
  title: "Terms",
  description:
    "The terms that apply to the yuvoy.in site: what joining the waitlist or applying as a host does, what it does not commit anyone to, and where booking happens.",
  // See the note on /privacy — indexing flips atomically once reviewed, and
  // all three halves of that flip were restored together on 2026-09-09
  // (yuvoy-web#152).
  robots: { index: false, follow: false },
};

/**
 * Terms of use for yuvoy.in.
 *
 * Scoped to what this site actually is. Yuvoy is open in Havelock, but booking
 * happens in the Yuvoy app (app.yuvoy.in), not here: this site takes no
 * booking, no payment and no account, so there is nothing to write terms about
 * beyond the waitlist and the host application. Booking or refund terms here
 * would describe something this site does not do.
 *
 * A full Terms of Service, covering bookings, payments, cancellations and the
 * host relationship, is a separate document and is not written yet
 * (yuvoy-web#182).
 */
export default function TermsPage() {
  return (
    <LegalPage
      title="Terms"
      updated="6 November 2026"
      intro={
        <p>
          Yuvoy is open in Havelock, in the Andaman Islands. This site,
          yuvoy.in, tells you about it and takes a waitlist and host
          applications. These terms cover what using it does and does not mean.
          They are short because the site does very little.
        </p>
      }
    >
      <LegalSection heading="What this site is">
        <p>
          Somewhere to read about Yuvoy, join the waitlist or apply as a host.
          You cannot book anything, pay for anything, or create an account on
          this site. Nothing listed on it is an offer of a specific experience,
          price, date or availability.
        </p>
        <p>
          Everything described as planned is exactly that: a description of what
          we intend to build, not a commitment to a date or a feature.
        </p>
      </LegalSection>

      <LegalSection heading="What joining the waitlist means">
        <p>
          It means we may contact you about Yuvoy, for example when it opens in
          a new place. It creates no booking, no payment obligation, no queue
          position and no guarantee of availability or priority, for travellers
          or for hosts.
        </p>
        <p>
          You can ask to be removed at any time. See the{" "}
          <Link
            href="/privacy"
            className="text-forest underline underline-offset-2"
          >
            Privacy page
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection heading="Applying as a host">
        <p>
          Applying tells us about you and your business. It does not create a
          listing, a partnership, an agency relationship or any exclusivity, and
          it does not commit either side to commercial terms.
        </p>
        <p>
          No commission rate, settlement schedule or payout arrangement has been
          agreed or published. Anything of that kind will be agreed with you
          directly, in writing, before it applies.
        </p>
      </LegalSection>

      <LegalSection heading="Booking an experience">
        <p>
          Booking happens in the Yuvoy app, not on this site, and these terms do
          not cover it.
        </p>
        <p>
          An experience you arrange directly with a host, outside Yuvoy, is
          between you and that host, under their terms and their insurance.
          Yuvoy is not a party to that arrangement, does not vet it, and takes
          no responsibility for it.
        </p>
      </LegalSection>

      <LegalSection heading="Using this site">
        <p>
          Please do not submit false details, attempt to disrupt the site, or
          use automated tools to submit the form. We may decline or remove any
          registration.
        </p>
        <p>
          The text, design and branding on this site belong to Yuvoy. The Yuvoy
          name and wordmark are ours.
        </p>
      </LegalSection>

      <LegalSection heading="Accuracy and availability">
        <p>
          We try to keep this site accurate, and we have deliberately avoided
          claiming anything we cannot currently do. Even so, it is provided as
          it is: we do not guarantee it will always be available or error-free.
        </p>
      </LegalSection>

      <LegalSection heading="Changes">
        <p>
          A fuller agreement, covering bookings, payments, cancellations and the
          host relationship, is still to be published. Until then these terms
          cover this site only, and the date at the top tells you when they were
          last revised.
        </p>
      </LegalSection>

      <LegalSection heading="Governing law">
        <p>
          These terms are governed by the laws of India, and the courts of India
          have jurisdiction over any dispute arising from them.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
