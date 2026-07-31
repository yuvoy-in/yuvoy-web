import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * Only the canonical homepage. Campaign routes are noindex, legal placeholders
 * are noindex until approved copy lands, and the retired pre-launch pages
 * (/experiences, /journal, /philosophy) answer 410 and must never reappear
 * here.
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
