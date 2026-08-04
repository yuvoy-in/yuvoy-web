import { Hero } from "@/components/landing/hero";
import { Insight } from "@/components/landing/insight";
import { Answer } from "@/components/landing/answer";
import { Strategy } from "@/components/landing/strategy";
import { JoinAside } from "@/components/landing/join-aside";
import { LeadForms, type LeadContext } from "@/components/landing/lead-forms";
import { LegacyProviderAnchor } from "@/components/landing/legacy-provider-anchor";
import { LandingView } from "@/components/analytics/landing-view";
import { LAUNCH_MARKET } from "@/lib/leads/registry";

/**
 * The homepage, composed. `/` renders it with organic defaults; the
 * /go/<source> campaign routes render it with their attribution context.
 * Header and footer come from the root layout.
 *
 * **This page is for travellers.** It was a pitch to both sides at once until
 * 2026-08-04, which meant a visitor met the operator case — six apps, an
 * Experience OS, a signed roster — on the way to a form that then asked which
 * of the two they were. Operators now have their own page, carrying all of
 * that, and the header names it in the middle of every screen. What is left
 * here answers one question for one person.
 *
 * The acts are written to pass the billboard test: reading only the headlines
 * tells the whole story.
 *
 *   Cover     "Every trip starts with one question."   the hook, island horizon
 *   Insight   "The hard part was never booking."       the observation
 *   Answer    "Scroll. Watch. Book."                   the product, running live
 *   Strategy  "One destination, done completely."      the wedge
 *   Ask       "Be there when it opens."                the form
 *
 * (Acts are deliberately unnumbered on the page itself, per owner direction.)
 * The page still ends in the registration form: a visitor who read this far
 * should not need one more click, and campaign traffic arriving from a
 * printed QR code converts on the page it lands on. `#register` still opens
 * it, and `#providers` still resolves, now by redirecting to the operator
 * application (see LegacyProviderAnchor).
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
      <LegacyProviderAnchor />
      <Hero />
      <Insight />
      <Answer />
      <Strategy />
      <LeadForms
        context={context}
        audiences={["traveller"]}
        aside={<JoinAside />}
      />
    </main>
  );
}
