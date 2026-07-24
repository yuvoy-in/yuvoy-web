import { renderOg, OG_SIZE, OG_CONTENT_TYPE } from "@/components/og/frame";
import { getPost } from "@/lib/journal/posts";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "The Yuvoy journal";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) {
    return renderOg({
      eyebrow: "Field Notes",
      title: "The journal",
      footer: "Yuvoy",
    });
  }
  return renderOg({
    eyebrow: post.category,
    title: post.title,
    footer: "Field Notes · Yuvoy",
  });
}
