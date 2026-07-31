import type { Metadata } from "next";
import { Landing } from "@/components/landing/landing";
import { DEFAULT_DESTINATION } from "@/lib/leads/registry";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/** Canonical homepage — organic traffic, indexable. */
export default function HomePage() {
  return (
    <Landing
      context={{ source: "web", destinationKey: DEFAULT_DESTINATION.key }}
    />
  );
}
