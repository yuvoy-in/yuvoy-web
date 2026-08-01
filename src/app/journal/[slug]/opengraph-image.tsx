import { renderOg, OG_SIZE, OG_CONTENT_TYPE } from "@/components/og/frame";
import { getJournalPost, getJournalPosts } from "@/lib/journal/posts";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "A field note from the Yuvoy journal";

export async function generateStaticParams() {
  return (await getJournalPosts()).map((post) => ({ slug: post.slug }));
}

/**
 * Each article shares as itself.
 *
 * Article pages set their own `openGraph` block in `generateMetadata`, which
 * replaces the inherited one — so without a file here they would ship with no
 * `og:image` at all and share as a bare link.
 */
export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getJournalPost(slug);

  return renderOg({
    eyebrow: "Journal",
    title: post?.title ?? "Field notes from the build",
    footer: "Experience more.",
  });
}
