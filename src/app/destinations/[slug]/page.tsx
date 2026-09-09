import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/site/page-header";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { JsonLd } from "@/components/site/json-ld";
import { breadcrumbSchema } from "@/lib/site/structured-data";
import { Section, SectionHeading } from "@/components/ui/section";
import { StatusNotice } from "@/components/site/status-notice";
import { DestinationGrid } from "@/components/destinations/destination-panel";
import { buttonVariants, ButtonArrow } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import {
  DESTINATIONS,
  availabilityMessage,
  destinationBySlug,
  otherDestinations,
} from "@/lib/site/destinations";
import { LAUNCH_STATUS_LABEL } from "@/lib/site/launch";
import { appHref } from "@/lib/site/product-links";

/** Only the known destinations exist; anything else is a 404. */
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
    // "Things to do in Havelock" is what a person actually searches for, and
    // it is true of a page that lists the kinds of day the island offers.
    title: `Things to do in ${destination.name}`,
    description: destination.shortDescription,
    alternates: { canonical: `/destinations/${destination.slug}` },
  };
}

/**
 * A destination page.
 *
 * ## Built entirely from data
 *
 * Every word about the place comes from `DESTINATIONS`. Adding a destination
 * is an entry in that file plus one in the lead registry — this page is not
 * touched, and neither is any other. That is the property that stops the site
 * being an Andaman site with three hardcoded pages.
 *
 * ## What it no longer repeats
 *
 * The Yuvoy product explanation, the platform disclaimer, and the other
 * islands' descriptions all appeared here as well as on three other pages.
 * What is left is what only this page can say: what the place is like, what
 * kinds of day it offers, where it sits in the launch, and one way in.
 *
 * The pre-launch position appears exactly once, in the status notice, and is
 * derived from the destination's own `launchStatus` rather than typed.
 *
 * Content is geography and character only. **No operator names, no prices, no
 * counts of anything** — "the widest range of days on the water" describes a
 * place; "eleven dive schools" would be a claim we cannot stand behind and
 * would have to maintain.
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

  const related = otherDestinations(destination);

  return (
    <main>
      <JsonLd
        schemas={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Destinations", path: "/#destinations" },
            {
              name: destination.name,
              path: `/destinations/${destination.slug}`,
            },
          ]),
        ]}
      />
      <PageHeader
        eyebrow={`${destination.region} · ${LAUNCH_STATUS_LABEL[destination.launchStatus]}`}
        title={destination.name}
        lede={
          <>
            {/*
              The official name, once per page, under the heading.

              It is the name on the ferry timetable and the one a visitor will
              be looking for when they book a crossing, so it is real content
              rather than trivia — and it is the registry's own label, which
              is what the API contract uses. That makes this the single place
              the site's name for a destination and the backend's have to
              agree, and an e2e test asserts it here for exactly that reason.
            */}
            <p className="label text-forest/75 mb-6">
              {destination.officialName}
            </p>
            <p>{destination.introDescription}</p>
            {destination.fullDescription.map((paragraph) => (
              <p key={paragraph} className="mt-4">
                {paragraph}
              </p>
            ))}
          </>
        }
      >
        <Breadcrumbs
          trail={[
            { label: "Home", href: "/" },
            { label: "Destinations", href: "/#destinations" },
            { label: destination.name },
          ]}
        />
      </PageHeader>

      <Section aria-labelledby="categories-heading">
        <SectionHeading
          id="categories-heading"
          eyebrow="What you can do here"
          title="The kinds of day"
          accent={`${destination.name} is known for.`}
        />
        <ul className="border-cream-line mt-14 grid grid-cols-1 gap-x-8 gap-y-8 border-t sm:grid-cols-2 lg:grid-cols-4">
          {destination.categories.map((category, i) => (
            <li key={category} className="pt-8 sm:pr-6">
              <span className="label text-forest/75">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="font-display text-forest tracking-display mt-4 text-xl leading-snug font-normal">
                {category}
              </p>
            </li>
          ))}
        </ul>

        {/* The only pre-launch statement on this page, derived from the
            destination's own status rather than typed into it. */}
        <StatusNotice className="mt-14">
          <p>{availabilityMessage(destination)}</p>
        </StatusNotice>
      </Section>

      <Section tone="ink" aria-labelledby="cta-heading">
        <SectionHeading
          id="cta-heading"
          tone="ink"
          eyebrow="Heading here?"
          title="See what is on in"
          accent={`${destination.name}.`}
          body="Browse what operators are running, and hear about the rest as it opens."
        />
        <div className="mt-12 flex flex-col gap-3 sm:flex-row">
          {/* Opens the app — yuvoy-web#154. An <a>: it leaves the origin. */}
          <a
            href={appHref("destination")}
            className={cn(
              buttonVariants({ variant: "paper", size: "lg" }),
              "w-full sm:w-auto",
            )}
          >
            Browse experiences
            <ButtonArrow />
          </a>
          <Link
            href="/#destinations"
            className={cn(
              buttonVariants({ variant: "outlineOnDark", size: "lg" }),
              "w-full sm:w-auto",
            )}
          >
            All destinations
          </Link>
        </div>
      </Section>

      {related.length > 0 && (
        <Section aria-labelledby="related-heading">
          <h2
            id="related-heading"
            className="font-display text-forest tracking-display text-2xl leading-snug font-normal sm:text-3xl"
          >
            Also opening first
          </h2>
          <DestinationGrid destinations={related} className="mt-10" />
        </Section>
      )}
    </main>
  );
}
