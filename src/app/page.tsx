import type { Metadata } from "next";
import { Landing } from "@/components/landing/landing";
import { JsonLd } from "@/components/site/json-ld";
import { organizationSchema, webSiteSchema } from "@/lib/site/structured-data";
import { DEFAULT_DESTINATION } from "@/lib/leads/registry";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/** Canonical homepage — organic traffic, indexable. */
export default function HomePage() {
  return (
    <>
      <JsonLd schemas={[organizationSchema(), webSiteSchema()]} />
      <Landing
        context={{ source: "web", destinationKey: DEFAULT_DESTINATION.key }}
      />
    </>
  );
}
