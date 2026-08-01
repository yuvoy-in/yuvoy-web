import { Hero } from "@/components/landing/hero";
import { TrustStrip } from "@/components/landing/trust-strip";
import { WatchFeelBook } from "@/components/landing/watch-feel-book";
import { Categories } from "@/components/landing/categories";
import { DestinationsTeaser } from "@/components/landing/destinations-teaser";
import { JourneysTeaser } from "@/components/landing/journeys-teaser";
import { SafetyTeaser } from "@/components/landing/safety-teaser";
import { OperatorInvitation } from "@/components/landing/operator-invitation";
import { Faq } from "@/components/landing/faq";
import { LeadForms, type LeadContext } from "@/components/landing/lead-forms";

/**
 * The homepage, composed. `/` renders it with organic defaults; the
 * /go/<source> campaign routes render it with their attribution context.
 * Header and footer come from the root layout.
 *
 * The section order is pinned by issue #27 and answers the reviewer's five
 * ten-second questions in sequence: what Yuvoy is (hero), where it stands
 * today (trust strip), how it works (watch/feel/book), what you can discover
 * (categories, destinations), how the two journeys differ, how we treat the
 * water, why operators should care — then the honest answers, then the form.
 *
 * The page ends in the registration form rather than another call to action:
 * a visitor who read this far should not need one more click, and campaign
 * traffic arriving from a printed QR code converts on the page it lands on.
 * The `#register` and `#providers` anchors live there and stay working
 * indefinitely (see LeadForms for why).
 *
 * The founder-story teaser that would sit between the operator invitation and
 * the FAQ is deliberately absent: it needs owner-supplied copy, and inventing
 * a founder story is exactly the class of thing this rebuild is undoing.
 */
export function Landing({ context }: { context: LeadContext }) {
  return (
    <main>
      <Hero />
      <TrustStrip />
      <WatchFeelBook />
      <Categories />
      <DestinationsTeaser />
      <JourneysTeaser />
      <SafetyTeaser />
      <OperatorInvitation />
      <Faq />
      <LeadForms context={context} />
    </main>
  );
}
