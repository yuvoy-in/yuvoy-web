import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { DESTINATIONS } from "@/lib/site/destinations";
import { getJournalPosts } from "@/lib/journal/posts";

/**
 * Every indexable route, and nothing else.
 *
 * Deliberately excluded, each for its own reason:
 * - `/go/*` — campaign routes, `noindex` by metadata and canonicalised to `/`.
 *   Listing them would put them in competition with the homepage.
 * - `/privacy`, `/terms` — real copy now, and still `noindex` and still on
 *   the robots disallow list, because it has not been through legal review.
 *   This comment used to say the copy was placeholder; it stopped being true
 *   on 2 August and 8 August respectively, and the next person to read it
 *   would have believed it (yuvoy-web#152).
 *
 *   They join this list in the same change that removes their `noindex` and
 *   takes them off the robots disallow list, never before — all three
 *   together, which is the rule stated in full in `robots.ts`.
 * - `/philosophy` and retired `/experiences/<slug>` detail pages — 410 Gone.
 *   A 410 in a sitemap is a contradiction that slows de-indexing.
 * - `/how-it-works`, `/travellers`, `/experiences`, `/destinations` — folded
 *   into `/explore` on 2026-08-06 and now redirects. A redirect in a sitemap
 *   is a crawl budget spent on a URL that no longer answers.
 *
 * Adding a route here without a `page.tsx` is a promise to a crawler we cannot
 * keep, so the e2e suite fetches every URL in this sitemap and fails on
 * anything that is not 200.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const posts = await getJournalPosts();

  const routes: {
    path: string;
    priority: number;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  }[] = [
    { path: "/", priority: 1, changeFrequency: "weekly" },
    { path: "/explore", priority: 0.9, changeFrequency: "weekly" },
    { path: "/waitlist", priority: 0.9, changeFrequency: "monthly" },
    { path: "/operators", priority: 0.8, changeFrequency: "monthly" },
    { path: "/safety", priority: 0.8, changeFrequency: "monthly" },
    { path: "/about", priority: 0.6, changeFrequency: "yearly" },
    { path: "/contact", priority: 0.6, changeFrequency: "yearly" },
    { path: "/journal", priority: 0.6, changeFrequency: "weekly" },
    ...posts.map((post) => ({
      path: `/journal/${post.slug}`,
      priority: 0.5,
      changeFrequency: "yearly" as const,
    })),
    ...DESTINATIONS.map((destination) => ({
      path: `/destinations/${destination.slug}`,
      priority: 0.6,
      changeFrequency: "monthly" as const,
    })),
  ];

  return routes.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
