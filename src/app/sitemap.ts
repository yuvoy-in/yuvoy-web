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
 * - `/privacy`, `/terms` — still placeholder copy and still `noindex`. They
 *   join this list in the same change that lands approved legal copy and
 *   removes them from the robots disallow list, never before: an indexed
 *   placeholder is worse than a noindexed one.
 * - `/journal`, `/philosophy`, and retired `/experiences/<slug>` detail pages
 *   — 410 Gone. A 410 in a sitemap is a contradiction that slows de-indexing.
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
    { path: "/waitlist", priority: 0.9, changeFrequency: "monthly" },
    { path: "/how-it-works", priority: 0.8, changeFrequency: "monthly" },
    { path: "/travellers", priority: 0.8, changeFrequency: "monthly" },
    { path: "/operators", priority: 0.8, changeFrequency: "monthly" },
    { path: "/safety", priority: 0.8, changeFrequency: "monthly" },
    { path: "/about", priority: 0.6, changeFrequency: "yearly" },
    { path: "/journal", priority: 0.6, changeFrequency: "weekly" },
    { path: "/experiences", priority: 0.7, changeFrequency: "monthly" },
    { path: "/destinations", priority: 0.7, changeFrequency: "monthly" },
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
