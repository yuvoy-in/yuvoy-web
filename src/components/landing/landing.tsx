import { Hero } from "@/components/landing/hero";
import { Insight } from "@/components/landing/insight";
import { Answer } from "@/components/landing/answer";
import { Strategy } from "@/components/landing/strategy";
import { Engine } from "@/components/landing/engine";
import { JoinAside } from "@/components/landing/join-aside";
import { LeadForms, type LeadContext } from "@/components/landing/lead-forms";
import { LandingView } from "@/components/analytics/landing-view";
import { LAUNCH_MARKET } from "@/lib/leads/registry";

/**
 * The homepage, composed. `/` renders it with organic defaults; the
 * /go/<source> campaign routes render it with their attribution context.
 * Header and footer come from the root layout.
 *
 * The page is a six-act pitch, and the acts are written to pass the billboard
 * test: reading only the headlines tells the whole story.
 *
 *   Cover     "Every trip starts with one question."   the hook, island horizon
 *   Insight   "The hard part was never booking."       the observation
 *   Answer    "Scroll. Watch. Book."                   the product, running live
 *   Strategy  "One destination, done completely."      the wedge
 *   Engine    "You run a business across six apps."    operators (+3 signed)
 *   Ask       "Be there when it opens."                the form
 *
 * (Acts are deliberately unnumbered on the page itself, per owner direction.)
 * The Season One phone preview runs inside the answer act, beside the steps
 * it demonstrates. The page still ends in the registration form: a visitor
 * who read this far should not need one more click, and campaign traffic
 * arriving from a printed QR code converts on the page it lands on. The
 * `#register` and `#providers` anchors live there and stay working
 * indefinitely (see LeadForms for why).
 */
export function Landing({ context }: { context: LeadContext }) {
  return (
    <main>
      <LandingView
        routeType={context.source === "web" ? "home" : "campaign"}
        source={context.source}
        marketKey={LAUNCH_MARKET.key}
        destinationKey={context.destinationKey}
      />
      <Hero />
      <Insight />
      <Answer />
      <Strategy />
      <Engine />
      <LeadForms context={context} aside={<JoinAside />} />
    </main>
  );
}
