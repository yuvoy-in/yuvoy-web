import type { Metadata } from "next";
import { LeadForms } from "@/components/landing/lead-forms";
import { LandingView } from "@/components/analytics/landing-view";
import {
  DEFAULT_DESTINATION,
  LAUNCH_MARKET,
  type LeadAudience,
} from "@/lib/leads/registry";

export const metadata: Metadata = {
  title: "Join the waitlist",
  description:
    "Join the Yuvoy waitlist for first access to local dives, boat days, food and culture in Havelock, Neil and Port Blair — or apply as a founding operator.",
  alternates: { canonical: "/waitlist" },
};

/**
 * The dedicated waitlist page.
 *
 * This replaces two permanent (308) redirects that used to point `/waitlist`
 * at homepage anchors. 308s are cached indefinitely by browsers and recorded
 * by crawlers, so two things must stay true for a long time:
 *
 *  1. `?audience=provider` still lands on the operator form. That URL shape is
 *     printed on physical operator materials and QR codes — treating it as
 *     optional polish would strand real people holding real paper.
 *  2. The homepage keeps its `#register` and `#providers` anchors, so anyone
 *     whose browser still holds the cached redirect arrives somewhere coherent.
 *
 * Both are covered by e2e tests.
 */
export default async function WaitlistPage({
  searchParams,
}: {
  searchParams: Promise<{ audience?: string }>;
}) {
  const { audience } = await searchParams;
  // Anything other than an explicit "provider" is a traveller. An unknown
  // value must never 404 or blank the page — it just gets the default tab.
  const initialAudience: LeadAudience =
    audience === "provider" ? "provider" : "traveller";

  return (
    <main>
      <LandingView
        routeType="waitlist"
        source="web"
        marketKey={LAUNCH_MARKET.key}
        destinationKey={DEFAULT_DESTINATION.key}
      />
      <LeadForms
        context={{ source: "web", destinationKey: DEFAULT_DESTINATION.key }}
        initialAudience={initialAudience}
        headingLevel={1}
        heading={
          initialAudience === "provider"
            ? "Apply as a founding operator"
            : "Join the waitlist"
        }
      />
    </main>
  );
}
