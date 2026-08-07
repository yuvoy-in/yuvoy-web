import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

/**
 * Journal posts, read from `content/journal/*.mdx` at build time.
 *
 * Frontmatter is validated rather than trusted: a post missing a title or a
 * date would otherwise render a blank card or sort unpredictably, and the
 * failure would only show up on the live index. Throwing here fails the build
 * instead, naming the file.
 *
 * **The journal ships only when it has something in it.** An empty journal
 * reads as abandoned, so the index and the nav entry are conditional on there
 * being at least one post — see `hasPosts()`.
 */
const JOURNAL_DIR = path.join(process.cwd(), "content/journal");

export interface JournalPostMeta {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  readingMinutes: number;
  /**
   * What kind of note this is. Optional in frontmatter and defaulted, because
   * a category is a way of grouping a journal that has enough posts to need
   * grouping — it must never become a required field that blocks publishing
   * the next one.
   */
  category: string;
}

/** Where a post with no `category` in its frontmatter lands. */
const DEFAULT_CATEGORY = "Field notes";

export interface JournalPost extends JournalPostMeta {
  body: string;
}

function parse(slug: string, raw: string): JournalPost {
  const { data, content } = matter(raw);
  const missing = (["title", "description", "publishedAt"] as const).filter(
    (key) => typeof data[key] !== "string" || !data[key],
  );
  if (missing.length > 0) {
    throw new Error(
      `content/journal/${slug}.mdx is missing frontmatter: ${missing.join(", ")}`,
    );
  }
  if (Number.isNaN(Date.parse(data.publishedAt as string))) {
    throw new Error(
      `content/journal/${slug}.mdx has an unparseable publishedAt: ${data.publishedAt}`,
    );
  }

  return {
    slug,
    title: data.title as string,
    description: data.description as string,
    publishedAt: data.publishedAt as string,
    readingMinutes:
      typeof data.readingMinutes === "number" ? data.readingMinutes : 3,
    category:
      typeof data.category === "string" && data.category
        ? data.category
        : DEFAULT_CATEGORY,
    body: content,
  };
}

async function readAll(): Promise<JournalPost[]> {
  let files: string[];
  try {
    files = await readdir(JOURNAL_DIR);
  } catch {
    // No content directory at all is a valid state, not an error.
    return [];
  }

  const posts = await Promise.all(
    files
      .filter((file) => file.endsWith(".mdx"))
      .map(async (file) => {
        const slug = file.replace(/\.mdx$/, "");
        return parse(
          slug,
          await readFile(path.join(JOURNAL_DIR, file), "utf8"),
        );
      }),
  );

  // Newest first.
  return posts.sort(
    (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
  );
}

export async function getJournalPosts(): Promise<JournalPost[]> {
  return readAll();
}

export async function getJournalPost(
  slug: string,
): Promise<JournalPost | undefined> {
  return (await readAll()).find((post) => post.slug === slug);
}

/** Whether the journal has anything worth showing. */
export async function hasPosts(): Promise<boolean> {
  return (await readAll()).length > 0;
}

/** Display form for a post date, e.g. "2 August 2026". */
export function formatPublished(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
