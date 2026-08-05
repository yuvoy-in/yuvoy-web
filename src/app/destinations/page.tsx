import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/site/page-header";
import { Section, SectionHeading } from "@/components/ui/section";
import { buttonVariants, ButtonArrow } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { LAUNCH_MARKET } from "@/lib/leads/registry";
import { DESTINATIONS, destinationHref } from "@/lib/site/destinations";

export const metadata: Metadata = {
  title: "Destinations",
  description:
    "Yuvoy opens in the Andaman Islands: Havelock, Neil and Port Blair. One market, covered properly, before anywhere else.",
  alternates: { canonical: "/destinations" },
};

export default function DestinationsPage() {
  return (
    <main>
      <PageHeader
        eyebrow="Destinations"
        title="One market,"
        accent="covered properly."
        lede={`Yuvoy opens in the ${LAUNCH_MARKET.label}: three islands, run through a full season, before we go anywhere else. Andaman is the first market, not the shape of the product.`}
      />

      <Section aria-labelledby="islands-heading">
        <SectionHeading
          id="islands-heading"
          eyebrow="The islands"
          title="Three places,"
          accent="three different days."
        />
        <ul className="mt-14 grid grid-cols-1 gap-px lg:grid-cols-3">
          {DESTINATIONS.map((destination, i) => (
            <li
              key={destination.key}
              className="border-cream-line border-t pt-10 lg:pr-10"
            >
              <span className="label text-forest/75">0{i + 1}</span>
              <h3 className="font-display text-forest mt-5 text-2xl font-semibold tracking-tight">
                <Link
                  href={destinationHref(destination)}
                  className="hover:text-terra-deep transition-colors duration-200"
                >
                  {destination.shortLabel}
                </Link>
              </h3>
              <p className="label text-forest/75 mt-2">{destination.label}</p>
              <p className="text-forest/75 mt-4 leading-relaxed">
                {destination.blurb}
              </p>
              <Link
                href={destinationHref(destination)}
                className="label tap-target text-terra-deep hover:text-forest mt-6 underline underline-offset-4"
              >
                About {destination.shortLabel}
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="ink" aria-labelledby="next-heading">
        <SectionHeading
          id="next-heading"
          tone="ink"
          eyebrow="After the Andamans"
          title="A second market is"
          accent="a decision, not a date."
          body="We would rather run one destination properly through a full season than open three badly. When a second market is decided, it will be announced here, not hinted at beforehand."
        />
        <Link
          href="/waitlist"
          className={cn(
            buttonVariants({ variant: "paper", size: "lg" }),
            "mt-12 flex w-full sm:inline-flex sm:w-auto",
          )}
        >
          Join the waitlist
          <ButtonArrow />
        </Link>
      </Section>
    </main>
  );
}
