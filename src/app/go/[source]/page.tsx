import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Landing } from "@/components/landing/landing";
import {
  CAMPAIGN_SOURCES,
  DEFAULT_DESTINATION,
  isCampaignSource,
  isDestinationKey,
} from "@/lib/leads/registry";

/**
 * Campaign/QR routes — /go/ferry, /go/kiosk, /go/hotel, /go/instagram,
 * /go/direct. Each renders the same landing with its source attribution and an
 * optional destination default (?d=andaman/neil), which the visitor can change.
 *
 * Noindex by design; canonical points at the homepage so campaign URLs never
 * compete with it in search.
 */

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  alternates: { canonical: "/" },
};

export function generateStaticParams() {
  return CAMPAIGN_SOURCES.map((source) => ({ source }));
}

// Only the five named campaign routes exist; anything else is not a page.
export const dynamicParams = false;

export default async function CampaignPage({
  params,
  searchParams,
}: {
  params: Promise<{ source: string }>;
  searchParams: Promise<{ d?: string }>;
}) {
  const { source } = await params;
  const sp = await searchParams;

  if (!isCampaignSource(source)) {
    // Unreachable with dynamicParams=false; belt and braces.
    redirect("/");
  }

  const destinationKey =
    sp.d && isDestinationKey(sp.d) ? sp.d : DEFAULT_DESTINATION.key;

  return <Landing context={{ source, destinationKey }} />;
}
