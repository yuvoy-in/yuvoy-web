import type { Metadata } from "next";
import { WaitlistChrome } from "@/components/waitlist/waitlist-chrome";
import { WaitlistFlow } from "@/components/waitlist/waitlist-flow";
import { LandingView } from "@/components/analytics/landing-view";
import { AUDIENCE_COPY, audienceFromParam } from "@/lib/site/audiences";
import { DEFAULT_DESTINATION, LAUNCH_MARKET } from "@/lib/leads/registry";

/**
 * The route's title follows the tab that is open.
 *
 * It read "Join the waitlist" on both sides until 2026-08-07 — including for
 * an operator who arrived on `?audience=provider` from their own printed
 * materials, which is the one visitor the page could not afford to mislabel.
 * An operator is applying, not joining, and the difference is the whole
 * framing of what they are agreeing to.
 *
 * The canonical stays `/waitlist` for both. They are two views of one route,
 * not two documents, and the operator case has a page of its own in
 * `/operators` — pointing a second canonical at a query string would split the
 * route's signals between them for nothing.
 */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ audience?: string }>;
}): Promise<Metadata> {
  const copy = AUDIENCE_COPY[audienceFromParam((await searchParams).audience)];
  return {
    title: copy.metaTitle,
    description: copy.metaDescription,
    alternates: { canonical: "/waitlist" },
  };
}

/**
 * The dedicated waitlist page — the one surface that speaks to both audiences.
 *
 * ## The shape (owner direction, 2026-08-07)
 *
 * **No site header.** Every other route wants navigation; this one wants a
 * form filled in, and the standing bar offered three ways off the page plus a
 * button pointing at the page you are already on. In its place, `WaitlistChrome`
 * puts the mark in the centre and one way back at the left. `SiteHeader`
 * suppresses itself here via `hidesSiteChrome`, so the two cannot both render.
 *
 * **Two tabs of page, not two tabs of form.** Selecting a side changes the
 * eyebrow, the headline, the promise underneath it, the questions beside the
 * form, the form itself and the route's title — all of it from `AUDIENCE_COPY`.
 * See `WaitlistFlow`.
 *
 * ## Two things that must stay true for a long time
 *
 * This route replaced two permanent (308) redirects that pointed `/waitlist`
 * at homepage anchors. 308s are cached indefinitely by browsers and recorded
 * by crawlers, so:
 *
 *  1. `?audience=provider` still opens the operator side. That URL shape is
 *     printed on physical operator materials and QR codes — treating it as
 *     optional polish would strand real people holding real paper.
 *  2. The homepage keeps its `#register` and `#providers` anchors, so anyone
 *     whose browser still holds the cached redirect arrives somewhere
 *     coherent. `#providers` resolves here too (see `WaitlistFlow`).
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
  // value must never 404 or blank the page — it just opens the default side.
  const initialAudience = audienceFromParam(audience);

  return (
    <>
      <LandingView
        routeType="waitlist"
        source="web"
        marketKey={LAUNCH_MARKET.key}
        destinationKey={DEFAULT_DESTINATION.key}
      />
      <WaitlistChrome />
      <WaitlistFlow
        context={{ source: "web", destinationKey: DEFAULT_DESTINATION.key }}
        initialAudience={initialAudience}
      />
    </>
  );
}
