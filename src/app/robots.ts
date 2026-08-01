import type { MetadataRoute } from "next";
import { SITE_URL, IS_PRODUCTION } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  if (!IS_PRODUCTION) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    /*
      `/go/` only.

      Campaign routes are noindex by metadata and canonicalised to `/`;
      disallowing them as well keeps them out of competition with the homepage.

      `/privacy` and `/terms` were also disallowed while their copy was
      placeholder. They come off this list in the same change that lands
      business-approved copy, removes their `noindex`, and adds them to the
      sitemap — all three together, never independently. An indexed placeholder
      is worse than a noindexed one.
    */
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/go/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
