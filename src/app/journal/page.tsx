import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { getAllPosts } from "@/lib/journal/posts";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Field Notes — quiet essays on the philosophy: the place, the people, and what it means to belong to somewhere briefly.",
};

export default function JournalPage() {
  const posts = getAllPosts();
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-16 sm:px-10">
        <p className="label text-terra">Field Notes</p>
        <h1 className="font-display text-forest mt-4 text-4xl sm:text-5xl">
          The journal.
        </h1>
        <p className="text-forest/70 mt-4 text-lg">
          Quiet essays on the philosophy — the place, the people, and what it
          means to belong to somewhere briefly.
        </p>
        <div className="divide-cream-line mt-12 divide-y">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/journal/${post.slug}`}
              className="group block py-8"
            >
              <p className="label text-forest/45">
                {post.category} · {formatDate(post.date)}
              </p>
              <h2 className="font-display text-forest group-hover:text-terra mt-2 text-2xl transition-colors">
                {post.title}
              </h2>
              <p className="text-forest/65 mt-2">{post.excerpt}</p>
            </Link>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
