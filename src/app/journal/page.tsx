import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/site/page-header";
import { Section } from "@/components/ui/section";
import { JournalCard } from "@/components/journal/journal-card";
import { getJournalPosts } from "@/lib/journal/posts";

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Stories from the places, people and experiences shaping Yuvoy, written down while they are still true.",
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
 * For the same reason the first post is always the lead story: one card in a
 * three-column grid looks like two posts went missing.
 *
 * The Journal is deliberately out of the desktop header until there is enough
 * of it to earn a slot (see `src/lib/site/nav.ts`); it lives in the shutter
 * menu and the footer meanwhile.
 */
export default async function JournalPage() {
  const posts = await getJournalPosts();
  if (posts.length === 0) notFound();

  const [lead, ...rest] = posts;

  return (
    <main>
      <PageHeader
        eyebrow="Journal"
        title="Field notes"
        accent="from Yuvoy."
        lede="Stories from the places, people and experiences shaping the platform."
      />

      <Section aria-labelledby="posts-heading">
        <h2 id="posts-heading" className="sr-only">
          All posts
        </h2>

        <JournalCard post={lead} variant="featured" />

        {rest.length > 0 && (
          <ul className="border-cream-line mt-16 border-t">
            {rest.map((post) => (
              <li key={post.slug} className="border-cream-line border-b">
                <JournalCard post={post} />
              </li>
            ))}
          </ul>
        )}
      </Section>
    </main>
  );
}
