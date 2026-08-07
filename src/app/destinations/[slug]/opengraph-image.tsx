import { renderOg, OG_SIZE, OG_CONTENT_TYPE } from "@/components/og/frame";
import { DESTINATIONS, destinationBySlug } from "@/lib/site/destinations";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "A Yuvoy destination in the Andaman Islands";

export function generateStaticParams() {
  return DESTINATIONS.map((destination) => ({ slug: destination.slug }));
}

/** Each destination shares when it looks like itself, not like the homepage. */
export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const destination = destinationBySlug(slug);

  return renderOg({
    eyebrow: destination?.region ?? "Destinations",
    title: destination
      ? `Things to do in ${destination.name}`
      : "The Andaman Islands",
    footer: "Experience more.",
  });
}
