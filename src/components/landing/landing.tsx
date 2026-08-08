import { Hero } from "@/components/landing/hero";
import { WhyYuvoy } from "@/components/landing/why-yuvoy";
import { FirstLaunch } from "@/components/landing/first-launch";
import { OperatorTeaser } from "@/components/landing/operator-teaser";
import { ContactGlance } from "@/components/site/contact-glance";
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
 * The acts are written to pass the billboard test: reading only the headlines
 * tells the whole story, in order, without a paragraph in between.
 *
 *   Cover        "Watch real experiences. Make one yours."       the promise
 *   Why          "From too many tabs to one simple place."       problem and product, one frame
 *   First launch "Opening in the Andaman Islands."               where
 *   Operators    "You run the experience. Yuvoy helps..."        the other side
 *   Ask          "Be first to experience Yuvoy."                 the form
 *   Questions    "Not sure where to start? Ask us."              a person, reachable
 *
 * ## What changed, and why
 *
 * **2026-08-06.** The page ran Cover → Why → Strategy → Ask. Strategy argued
 * the launch wedge with three figures (three islands, one season, 100%
 * operator-filmed), which answers an investor's question rather than a
 * traveller's, and the page never said where Yuvoy opens. `FirstLaunch`
 * replaced it.
 *
 * **2026-08-07 (owner direction).** Two more acts came off. The category grid
 * ("Choose the kind of day you want") moved to `/explore`, where browsing is
 * the point — on a homepage it was a third answer to a question the cover and
 * the why act had already answered. The sign-off ("Don't be a tourist.
 * Experience more.") went with it: the wordmark already carries that line as
 * part of the drawn lockup, so setting it again at display scale was the brand
 * saying its own tagline twice on one page.
 *
 * The operator section is deliberately small. Operators moved off this page on
 * 2026-08-04 because a full pitch aimed at them sat between a traveller and
 * the form; three sentences and a way out is not that pitch, and there is
 * still no operator form here, no audience picker, and nothing a traveller has
 * to read past.
 *
 * Surface rhythm (owner direction, 2026-08-07): forest cover → cream why →
 * forest destinations → cream operators → forest form → cream contact →
 * forest footer. **It alternates the whole way down**, which is what the
 * design system asks for and what the page did not do until the
 * destination and operator acts swapped surfaces: before that it ran two
 * cream acts and then three dark ones, and the operator act had to draw its
 * own hairline to stop merging into the form beneath it.
 *
 * Every join is now a tone change, so no join needs a rule across it — three
 * of them came off in that change. The destination plates were already
 * forest, so on a forest section they stop being panels on the page and
 * become photographs bleeding into it.
 *
 * The page still ends in the registration form: a visitor who read this far
 * should not need one more click, and campaign traffic arriving from a printed
 * QR code converts on the page it lands on. `#register` still opens it, and
 * `#providers` still resolves, now by redirecting to the operator application
 * (see LegacyProviderAnchor).
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
      <LegacyProviderAnchor source={context.source} />
      <Hero />
      <WhyYuvoy />
      <FirstLaunch />
      <OperatorTeaser source={context.source} />
      <LeadForms context={context} audience="traveller" aside={<JoinAside />} />
      {/* After the ask, not before it: a visitor who has just been asked to
          join and did not is exactly the visitor with a question. It is also
          the cream breath between the form and the footer, both forest. */}
      <ContactGlance />
    </main>
  );
}
