import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/site/legal-page";
import {
  analyticsConfigured,
  analyticsHostedInEu,
} from "@/lib/analytics/config";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "What Yuvoy collects when you join the waitlist, why, where it is stored, and how to have it deleted.",
  // Stays noindexed until the copy has been legally reviewed. Removing this,
  // taking /privacy off the robots disallow list, and adding it to the sitemap
  // are ONE atomic change — an indexed page nobody has checked is worse than a
  // hidden one, and the page is reachable from the footer either way.
  //
  // The three came apart in early September and were put back together on
  // 2026-09-09 (yuvoy-web#152, owner's call). The copy is no longer
  // placeholder; legal review is what is outstanding.
  robots: { index: false, follow: false },
};

/**
 * Privacy Policy.
 *
 * **Every statement here describes what the system actually does today.** It
 * was written against the lead contract and the backend handover, not from a
 * template: the fields listed are the fields the form sends, the storage
 * description matches where rows actually go, and the analytics section says
 * "nothing is running" because nothing is.
 *
 * Two things are deliberately absent rather than invented:
 *  - A retention period. None has been set, so none is claimed.
 *  - A grievance-officer address. India's DPDP Act expects one; there is no
 *    monitored inbox yet, and publishing an unread address would be worse
 *    than publishing none. Raised with the owner.
 *
 * Not legal advice. Reviewed copy replaces this before the indexing flip.
 */
export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy"
      updated="8 August 2026"
      intro={
        <p>
          Yuvoy is not open yet. The only personal information this site
          collects is what you type into one of its two forms: the waitlist and
          operator application, or the contact form. This page describes exactly
          what that is, what happens to it, and how to get it removed.
        </p>
      }
    >
      <LegalSection heading="What we collect">
        <p>Only what you enter. Nothing is gathered in the background.</p>
        <p>
          <strong className="text-forest font-bold">
            If you join as a traveller:
          </strong>{" "}
          your name and your email address, plus a WhatsApp number if you would
          rather we message you there. That is the whole form. It asked which
          destination you were headed to and what interested you until August
          2026; both were dropped, because neither changed what we do and a
          waitlist should ask for the least it can.
        </p>
        <p>
          <strong className="text-forest font-bold">
            If you apply as an operator:
          </strong>{" "}
          your name, your business name and your email address, plus a WhatsApp
          number if you give one. It asked which destinations you cover and what
          you mainly offer until August 2026; both were dropped, because they
          are answered in the conversation that follows and an application
          should take thirty seconds.
        </p>

        <p>
          <strong className="text-forest font-bold">
            If you send us a message:
          </strong>{" "}
          your name, your email address, the topic you picked, and whatever you
          write. Nothing else. A message is not a registration, and it does not
          put you on any list.
        </p>
        <p>
          A phone number is stored in its full international form (for example
          <span className="whitespace-nowrap"> +91 90000 00000</span>), which is
          also how we recognise a repeat registration rather than creating a
          second record of you.
        </p>
        <p>
          We also record which link brought you to the site, so we know which
          channels are worth continuing.
        </p>
      </LegalSection>

      <LegalSection heading="Why we collect it">
        <p>
          To contact you about Yuvoy opening and, for operators, to have a
          conversation about what you offer. That is the whole purpose.
        </p>
        <p>
          A message you send through the contact form is used to answer you, and
          nothing else. There is no marketing option on that form and no place
          to store one, so it cannot quietly become a mailing list later.
        </p>
        <p>
          If you ticked the separate optional box, we may also send occasional
          updates about Yuvoy. You can join the waitlist without ticking it, and
          it changes nothing else about your registration.
        </p>
        <p>
          We do not sell your details, share them with third parties for their
          own purposes, or use them for advertising.
        </p>
      </LegalSection>

      <LegalSection heading="Where it is stored">
        <p>
          Your details are stored in our own database, hosted on Amazon Web
          Services infrastructure. Access is limited to the people running
          Yuvoy.
        </p>
        <p>
          When you submit the form, an internal notification is sent to the
          Yuvoy team so a person sees it. That notification goes to us, not to
          you; there is no automatic reply, and you should not expect an email
          confirming your registration.
        </p>
        <p>
          We keep a record of what you consented to and when, because we need to
          be able to show that you agreed rather than simply asserting it.
        </p>
      </LegalSection>

      <LegalSection heading="If you register more than once">
        <p>
          Submitting the waitlist or operator form again with the same contact
          updates your existing entry rather than creating a second one. Each
          individual submission is kept as history so we can see what changed.
        </p>
        <p>
          Messages work the other way round: they are never merged. Two
          questions from the same address are two questions, and both are kept.
        </p>
      </LegalSection>

      <LegalSection heading="Analytics">
        <AnalyticsDisclosure />
        <p>
          One thing runs without asking: Vercel Speed Insights, which measures
          how quickly pages load. It records performance timings only. It does
          not build a profile of you and does not follow you between sites.
        </p>
      </LegalSection>

      <LegalSection heading="Your choices">
        <p>
          You can ask us to correct your details, or to delete your registration
          entirely. Message us from the WhatsApp number or email address you
          registered with, and we will act on it.
        </p>
        <p>
          Deleting your registration removes you from the waitlist. There is no
          penalty for it and no obligation to explain. The same applies to a
          message you have sent us.
        </p>
      </LegalSection>

      <LegalSection heading="Children">
        <p>
          This site is not intended for children, and the waitlist is not meant
          to be used by anyone under 18.
        </p>
      </LegalSection>

      <LegalSection heading="Changes to this page">
        <p>
          If what we do with your information changes, this page changes first.
          The date at the top tells you when it was last revised.
        </p>
      </LegalSection>
    </LegalPage>
  );
}

/**
 * What this page says about analytics, derived from what actually runs.
 *
 * The section used to be prose, and prose can be false. It promised, in its
 * own words, that "this page will be updated before it goes live" — which made
 * the correct order of operations *edit the page, then set the key*, and left
 * the page saying analytics were running during the gap. Either ordering
 * produced a window in which /privacy was untrue. See yuvoy-web#84.
 *
 * So it is derived instead. `analyticsConfigured()` is the same predicate that
 * decides whether the consent banner appears and whether anything is ever
 * captured, and `analyticsHostedInEu()` reads the host the SDK is actually
 * pointed at. Setting `NEXT_PUBLIC_POSTHOG_KEY` now updates this page in the
 * same deploy, because there is nothing separate to remember.
 *
 * Every claim below is checked against code, not assumed:
 *
 *   "only if you agree first"    consent gates `grant()`; `load()` returns
 *                                null until then — lib/analytics/client.ts
 *   "not loaded"                 posthog-js is a dynamic import inside load()
 *   "hosted in the EU"           derived, not stated — analyticsHostedInEu()
 *   "no name, email, phone"      every payload is built by a named function in
 *                                lib/analytics/events.ts, and a unit test
 *                                asserts none can emit an email-, phone- or
 *                                UUID-shaped value
 *   "no way to link ... to you"  `person_profiles: "never"`, and there is
 *                                deliberately no join key to a lead row
 *   "we do not record your screen"      `disable_session_recording: true`
 *   "we do not capture clicks automatically"  `autocapture: false`
 *   the event list               EVENTS in lib/analytics/events.ts, closed
 *   "Privacy choices in the footer"     components/analytics/consent-banner
 */
function AnalyticsDisclosure() {
  if (!analyticsConfigured()) {
    return (
      <>
        <p>
          <strong className="text-forest font-bold">
            No product analytics are running on this site.
          </strong>{" "}
          Nothing tracks what you click or how you move through the pages, and
          there is no cookie banner, because there is nothing to consent to.
        </p>
        <p>
          The site is built to support privacy-respecting analytics later. If
          that is switched on,{" "}
          {analyticsHostedInEu() ? "it will be hosted in the EU, " : ""}it will
          only run after you explicitly agree, the events it records will carry
          no name, email, phone number or reference to your registration, and
          this page will say so.
        </p>
      </>
    );
  }

  return (
    <>
      <p>
        <strong className="text-forest font-bold">
          We use PostHog to understand how this site is used, but only if you
          agree first.
        </strong>{" "}
        Until you do, it is not loaded and nothing is recorded. If you never
        agree, nothing ever is.
      </p>
      <p>
        {analyticsHostedInEu() ? "It is hosted in the EU. The" : "The"} events
        it records carry no name, email, phone number, or any reference to your
        registration. There is deliberately no way to link what you clicked to
        who you are. We record which pages you saw, which destination or
        audience you chose, whether a preview played, whether a registration was
        started, failed validation, or completed, and whether you changed this
        choice. We do not record your screen, and we do not capture clicks
        automatically.
      </p>
      <p>
        You can change your mind whenever you like: “Privacy choices” in the
        footer turns it back off.
      </p>
    </>
  );
}
