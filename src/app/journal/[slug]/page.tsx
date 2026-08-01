import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { PageHeader } from "@/components/site/page-header";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { JsonLd } from "@/components/site/json-ld";
import { breadcrumbSchema } from "@/lib/site/structured-data";
import {
  formatPublished,
  getJournalPost,
  getJournalPosts,
} from "@/lib/journal/posts";

export async function generateStaticParams() {
  return (await getJournalPosts()).map((post) => ({ slug: post.slug }));
}

/** Only real posts exist; anything else is a 404, not an empty article. */
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getJournalPost(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/journal/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      publishedTime: post.publishedAt,
    },
  };
}

/**
 * A journal article.
 *
 * Prose styling is applied here rather than in the MDX, so an article is plain
 * Markdown and stays readable as a document. The component map keeps headings
 * on the design system's type scale and continues the page's heading order —
 * the page's h1 is the title, so article headings start at h2.
 */
const components = {
  h2: (props: React.ComponentProps<"h2">) => (
    <h2
      className="font-display text-teal mt-12 text-2xl font-bold tracking-tight first:mt-0"
      {...props}
    />
  ),
  h3: (props: React.ComponentProps<"h3">) => (
    <h3
      className="font-display text-teal mt-8 text-xl font-bold tracking-tight"
      {...props}
    />
  ),
  p: (props: React.ComponentProps<"p">) => (
    <p className="text-teal/75 mt-5 leading-relaxed" {...props} />
  ),
  ul: (props: React.ComponentProps<"ul">) => (
    <ul
      className="text-teal/75 mt-5 flex list-disc flex-col gap-2 pl-5 leading-relaxed"
      {...props}
    />
  ),
  a: (props: React.ComponentProps<"a">) => (
    <a className="text-teal underline underline-offset-2" {...props} />
  ),
  strong: (props: React.ComponentProps<"strong">) => (
    <strong className="text-teal font-semibold" {...props} />
  ),
};

export default async function JournalArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getJournalPost(slug);
  if (!post) notFound();

  return (
    <main>
      <JsonLd
        schemas={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Journal", path: "/journal" },
            { name: post.title, path: `/journal/${post.slug}` },
          ]),
        ]}
      />

      <PageHeader
        eyebrow={`${formatPublished(post.publishedAt)} · ${post.readingMinutes} min read`}
        title={post.title}
        lede={post.description}
      >
        <Breadcrumbs
          trail={[
            { label: "Home", href: "/" },
            { label: "Journal", href: "/journal" },
            { label: post.title },
          ]}
        />
      </PageHeader>

      <div className="container-page py-16 sm:py-20">
        <article className="max-w-2xl">
          <MDXRemote source={post.body} components={components} />
        </article>
        <Link
          href="/journal"
          className="label tap-target text-terra-deep hover:text-teal mt-14 underline underline-offset-4"
        >
          ← All field notes
        </Link>
      </div>
    </main>
  );
}
