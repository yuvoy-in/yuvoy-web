import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * Only the canonical homepage, for now.
 *
 * /experiences is a real page again (rebuilt as a category page, with the old
 * detail slugs still 410); /journal and /philosophy are still 410 and must not
 * appear here. Expanding this list to every indexable route is WEB-E's job —
 * do it there rather than adding routes piecemeal.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/`,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
