import type { MetadataRoute } from "next";
import { experienceSlugs } from "@/lib/experiences/data";
import { postSlugs } from "@/lib/journal/posts";
import { SITE_URL } from "@/lib/site";

const BASE = SITE_URL;

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    "",
    "/experiences",
    "/philosophy",
    "/journal",
    "/waitlist",
  ].map((path) => ({
    url: `${BASE}${path}`,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const experiences = experienceSlugs().map((slug) => ({
    url: `${BASE}/experiences/${slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const journal = postSlugs().map((slug) => ({
    url: `${BASE}/journal/${slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...pages, ...experiences, ...journal];
}
