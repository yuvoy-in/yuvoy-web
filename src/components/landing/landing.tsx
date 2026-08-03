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
 * test — reading only the headlines tells the whole story:
 *
 *   Cover  — "Every trip starts with one question."   the hook + the product
 *   01     — "The hard part was never booking."        the insight
 *   02     — "Scroll. Watch. Book."                    the answer
 *   03     — "One destination, done completely."       the strategy
 *   04     — "You run a business across six apps."     the engine (+3 signed)
 *   05     — "Be there when it opens."                 the ask
 *
 * The product itself runs on the cover (the Season One phone preview) rather
 * than three sections deep — nobody should have to read to see the thing.
 * The page still ends in the registration form: a visitor who read this far
 * should not need one more click, and campaign traffic arriving from a
 * printed QR code converts on the page it lands on. The `#register` and
 * `#providers` anchors live there and stay working indefinitely (see
 * LeadForms for why).
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
