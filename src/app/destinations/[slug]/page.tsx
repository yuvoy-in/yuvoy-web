import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/site/page-header";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { JsonLd } from "@/components/site/json-ld";
import { breadcrumbSchema } from "@/lib/site/structured-data";
import { Section, SectionHeading } from "@/components/ui/section";
import { buttonVariants, ButtonArrow } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { DESTINATIONS, destinationBySlug } from "@/lib/site/destinations";

/** Only the three known destinations exist; anything else is a 404. */
export function generateStaticParams() {
  return DESTINATIONS.map((destination) => ({ slug: destination.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const destination = destinationBySlug(slug);
  if (!destination) return {};

  return {
    title: destination.label,
    description: destination.blurb,
    alternates: { canonical: `/destinations/${destination.slug}` },
  };
}

/**
 * A destination page.
 *
 * Content is geography and character only. **No operator names, no prices, no
 * counts of anything** — "the widest range of days on the water" is a
 * description of a place, "eleven dive schools" would be a claim we cannot
 * stand behind and would have to maintain.
 */
export default async function DestinationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const destination = destinationBySlug(slug);
  // Unreachable with dynamicParams=false; belt and braces.
  if (!destination) notFound();

  return (
    <main>
      <JsonLd
        schemas={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Destinations", path: "/destinations" },
            {
              name: destination.shortLabel,
              path: `/destinations/${destination.slug}`,
            },
          ]),
        ]}
      />
      <PageHeader
        eyebrow={destination.label}
        title={destination.shortLabel}
        lede={destination.body.map((paragraph, i) => (
          <p key={paragraph} className={i > 0 ? "mt-4" : undefined}>
            {paragraph}
          </p>
        ))}
      >
        <Breadcrumbs
          trail={[
            { label: "Home", href: "/" },
            { label: "Destinations", href: "/destinations" },
            { label: destination.shortLabel },
          ]}
        />
      </PageHeader>

      <Section aria-labelledby="focus-heading">
        <SectionHeading
          id="focus-heading"
          eyebrow="The first season"
          title="What we are"
          accent="looking for here."
          body="The kinds of day we are curating on this island. Not a catalogue — no experience on Yuvoy is listed or bookable yet."
        />
        <ul className="border-cream-line mt-12 grid grid-cols-1 gap-px border-t sm:grid-cols-3">
          {destination.focus.map((item, i) => (
            <li key={item} className="pt-8 sm:pr-8">
              <span className="label text-teal/75">0{i + 1}</span>
              <p className="font-display text-teal mt-4 text-lg font-bold tracking-tight">
                {item}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="teal" aria-labelledby="cta-heading">
        <SectionHeading
          id="cta-heading"
          tone="teal"
          eyebrow="Heading here?"
          title={`Tell us you're going to`}
          accent={`${destination.shortLabel}.`}
          body="Pick this island when you join and it is where we start when we get in touch."
        />
        <div className="mt-12 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/waitlist"
            className={cn(
              buttonVariants({ size: "lg" }),
              "focus-visible:ring-offset-teal w-full sm:w-auto",
            )}
          >
            Join the traveller waitlist
            <ButtonArrow />
          </Link>
          <Link
            href="/destinations"
            className={cn(
              buttonVariants({ variant: "outlineOnDark", size: "lg" }),
              "w-full sm:w-auto",
            )}
          >
            All destinations
          </Link>
        </div>
      </Section>
    </main>
  );
}
