import type { MetadataRoute } from "next";
import { SITE_URL, IS_PRODUCTION } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  if (!IS_PRODUCTION) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    // /go/* are QR/campaign routes (noindex by metadata too); /privacy and
    // /terms stay out until business-approved copy replaces the placeholders.
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/go/", "/privacy", "/terms"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
