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

      `/privacy` and `/terms` are here for a different reason, and the rule
      about them is the load-bearing part of this file: they come off this
      list in the SAME CHANGE that lands reviewed copy, removes their
      `noindex`, and adds them to the sitemap — all three together, never
      independently.

      That rule was broken between 2 and 9 September 2026 and is restored
      here (yuvoy-web#152). Step one happened on its own: the two paths came
      off this list while both pages still answered `noindex` and the sitemap
      still excluded them with a comment calling their copy placeholder. So
      `robots.txt` invited crawlers to two pages that told them to go away,
      and the note explaining why described a state that had stopped being
      true. Each half looked deliberate on its own, which is exactly the
      failure mode this rule exists to prevent.

      The copy is no longer placeholder — both pages are real, scoped and
      honest — but it has not been through legal review, and the owner's call
      on 2026-09-09 was to keep them out of the index until it has. The pages
      stay reachable: `noindex` keeps them out of search results, not out of
      the footer, and anybody doing diligence follows the link rather than
      searching for it.

      The real flip is one change, at launch, with reviewed copy behind it.
    */
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/go/", "/privacy", "/terms"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
