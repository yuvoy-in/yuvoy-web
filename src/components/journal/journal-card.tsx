import Link from "next/link";
import { cn } from "@/lib/cn";
import { formatPublished, type JournalPostMeta } from "@/lib/journal/posts";

/**
 * A journal entry, in two sizes.
 *
 * `featured` is the lead story: the title at display scale on its own row,
 * with the metadata above it. `list` is everything after it, set as a ruled
 * editorial row rather than a boxed card.
 *
 * ## Why there is a featured size at all
 *
 * With one post, a three-column grid renders one card and two empty columns,
 * which reads as a journal that has been abandoned rather than one that has
 * just started. A single story, given the whole measure, reads as a decision.
 * The index switches automatically on the count — nobody has to remember.
 */
export function JournalCard({
  post,
  variant = "list",
}: {
  post: JournalPostMeta;
  variant?: "featured" | "list";
}) {
  const featured = variant === "featured";

  return (
    <Link
      href={`/journal/${post.slug}`}
      className={cn(
        "group focus-visible:ring-terra-deep rounded-edge block focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:outline-none",
        featured
          ? "py-2"
          : "grid grid-cols-1 gap-x-8 gap-y-3 py-8 sm:grid-cols-12",
      )}
    >
      <div className={featured ? undefined : "sm:col-span-3"}>
        <p className="label text-forest/75 flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-terra-deep">{post.category}</span>
          <span aria-hidden>·</span>
          {formatPublished(post.publishedAt)}
        </p>
      </div>

      <div className={featured ? "mt-6" : "sm:col-span-9"}>
        <h3
          className={cn(
            "font-display text-forest group-hover:text-terra-deep tracking-display font-normal transition-colors duration-200",
            featured
              ? "text-[clamp(2rem,5vw,3.25rem)] leading-[1.05] text-balance"
              : "text-2xl",
          )}
        >
          {post.title}
        </h3>
        <p
          className={cn(
            "text-forest/75 mt-4 leading-relaxed",
            featured ? "max-w-2xl text-lg" : "max-w-2xl",
          )}
        >
          {post.description}
        </p>
        <p className="label text-forest/75 mt-5 flex items-center gap-2">
          {post.readingMinutes} min read
          <span
            aria-hidden
            className="text-terra-deep ease-interaction transition-transform duration-200 group-hover:translate-x-1"
          >
            →
          </span>
        </p>
      </div>
    </Link>
  );
}
