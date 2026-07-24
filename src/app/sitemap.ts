import type { MetadataRoute } from "next";
import { experienceSlugs } from "@/lib/experiences/data";

const BASE = "https://yuvoy.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/experiences", "/philosophy", "/waitlist"].map(
    (path) => ({
      url: `${BASE}${path}`,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.8,
    }),
  );

  const experiences = experienceSlugs().map((slug) => ({
    url: `${BASE}/experiences/${slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...pages, ...experiences];
}
