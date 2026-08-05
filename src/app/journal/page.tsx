import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/site/page-header";
import { Section } from "@/components/ui/section";
import { getJournalPosts, formatPublished } from "@/lib/journal/posts";

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Field notes from building Yuvoy: why we are starting where we are, and what we are learning from the islands.",
  alternates: { canonical: "/journal" },
};

/**
 * The journal index.
 *
 * This URL previously answered 410, because the pre-launch site published
 * journal entries alongside fabricated experience content. It returns only now
 * that there is something real to read.
 *
 * If every post were removed the index would 404 rather than render an empty
 * shell — an empty journal reads as abandoned, which is worse than no journal.
 */
export default async function JournalPage() {
  const posts = await getJournalPosts();
  if (posts.length === 0) notFound();

  return (
    <main>
      <PageHeader
        eyebrow="Journal"
        title="Field notes"
        accent="from the build."
        lede="What we are figuring out, written down while it is still true. No announcements, no launch dates we cannot hold to."
      />

      <Section aria-labelledby="posts-heading">
        <h2 id="posts-heading" className="sr-only">
          All posts
        </h2>
        <ul className="border-cream-line border-t">
          {posts.map((post) => (
            <li key={post.slug} className="border-cream-line border-b">
              <Link
                href={`/journal/${post.slug}`}
                className="group grid grid-cols-1 gap-x-8 gap-y-3 py-8 sm:grid-cols-12"
              >
                <div className="sm:col-span-3">
                  <p className="label text-forest/75">
                    {formatPublished(post.publishedAt)}
                  </p>
                </div>
                <div className="sm:col-span-9">
                  <h3 className="font-display text-forest group-hover:text-terra-deep tracking-display text-2xl font-normal transition-colors duration-200">
                    {post.title}
                  </h3>
                  <p className="text-forest/75 mt-3 max-w-2xl leading-relaxed">
                    {post.description}
                  </p>
                  <p className="label text-forest/75 mt-4">
                    {post.readingMinutes} min read
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Section>
    </main>
  );
}
