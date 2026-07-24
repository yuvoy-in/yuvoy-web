import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { mdxComponents } from "@/components/journal/mdx-components";
import { getPost, postSlugs } from "@/lib/journal/posts";
import { formatDate } from "@/lib/format";

export function generateStaticParams() {
  return postSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Not found" };
  return { title: post.title, description: post.excerpt };
}

export default async function JournalPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-6 py-16 sm:px-10">
        <p className="label text-terra">{post.category}</p>
        <h1 className="font-display text-forest mt-4 text-4xl leading-tight sm:text-5xl">
          {post.title}
        </h1>
        <p className="text-forest/50 mt-4 text-sm">
          {formatDate(post.date)} · {post.author}
        </p>
        <article className="mt-8">
          <MDXRemote source={post.content} components={mdxComponents} />
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
