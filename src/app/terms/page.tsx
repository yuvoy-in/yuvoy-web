import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/site/legal-page";

export const metadata: Metadata = {
  title: "Terms",
  description:
    "The terms that apply to this pre-launch Yuvoy site: what joining the waitlist does, what it does not commit anyone to, and who you are dealing with today.",
  // See the note on /privacy — indexing flips atomically once reviewed.
  robots: { index: false, follow: false },
};

/**
 * Terms of use for the pre-launch site.
 *
 * Scoped to what the site actually is: a waitlist. There is no booking, no
 * payment, no account and no marketplace transaction, so there is nothing to
 * write terms about beyond registration itself — and writing speculative
 * booking or refund terms now would describe a product that does not exist.
 *
 * A full Terms of Service, covering bookings, payments, cancellations and the
 * operator relationship, is a separate document for when those exist.
 */
export default function TermsPage() {
  return (
    <LegalPage
      title="Terms"
      updated="2 August 2026"
      intro={
        <p>
          This site is a waitlist for a product that has not opened yet. These
          terms cover what joining it does and does not mean. They are short
          because the site does very little.
        </p>
      }
    >
      <LegalSection heading="What Yuvoy is today">
        <p>
          A pre-launch site. You cannot book anything, pay for anything, or
          create an account. Nothing listed on this site is an offer of a
          specific experience, price, date or availability.
        </p>
        <p>
          Everything described as planned is exactly that: a description of what
          we intend to build, not a commitment to a date or a feature.
        </p>
      </LegalSection>

      <LegalSection heading="What joining the waitlist means">
        <p>
          It means we may contact you about Yuvoy opening. It creates no
          booking, no payment obligation, no queue position and no guarantee of
          availability or priority, for travellers or for operators.
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

      <LegalSection heading="Applying as an operator">
        <p>
          Applying starts a conversation. It does not create a listing, a
          partnership, an agency relationship or any exclusivity, and it does
          not commit either side to commercial terms.
        </p>
        <p>
          No commission rate, settlement schedule or payout arrangement has been
          agreed or published. Anything of that kind will be agreed with you
          directly, in writing, before it applies.
        </p>
      </LegalSection>

      <LegalSection heading="Experiences you arrange now">
        <p>
          Until Yuvoy opens, any experience you take in the islands is arranged
          directly between you and the operator running it, under their terms
          and their insurance. Yuvoy is not a party to that arrangement, does
          not vet those operators, and takes no responsibility for it.
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
          These terms will be replaced by a fuller agreement before booking
          opens, one that covers payments, cancellations and the operator
          relationship, none of which exist yet. Until then, the date at the top
          tells you when this was last revised.
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
