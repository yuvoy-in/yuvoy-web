import { renderOg, OG_SIZE, OG_CONTENT_TYPE } from "@/components/og/frame";
import { getExperience } from "@/lib/experiences/data";
import { CATEGORY_META } from "@/lib/experiences/category";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "A Yuvoy experience";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const experience = getExperience(slug);
  if (!experience) {
    return renderOg({
      eyebrow: "Yuvoy",
      title: "An experience",
      footer: "Experience More.",
    });
  }
  return renderOg({
    eyebrow: `${CATEGORY_META[experience.category].label} · ${experience.location}`,
    title: experience.title,
    footer: "Experience More.",
  });
}
