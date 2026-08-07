import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    /*
      Next only serves the qualities listed here, so that a URL parameter
      cannot make the optimiser render an arbitrary number of variants.
      75 is its default and what photography uses; 100 exists for the brand
      mark alone, where lossy re-encoding is visible as fringing on the thin
      brush strokes (see WaveMark).
    */
    qualities: [75, 100],
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },

  /**
   * The 2026-08-06 consolidation, kept honest.
   *
   * `/experiences`, `/destinations`, `/how-it-works` and `/travellers` were
   * four pages answering one question in four places. They are now four
   * sections of `/explore`, and these redirects are what stops the links
   * already published, indexed and printed from breaking.
   *
   * **They are 307/302, not 308/301.** `permanent: false` is deliberate and
   * load-bearing: a browser caches a permanent redirect indefinitely, so a
   * 308 here would make the decision to fold these pages together
   * irreversible on every machine that ever saw one. The IA is new enough
   * that it must stay reversible. Promote these to permanent only once the
   * shape has held for a season.
   *
   * Order matters. `/destinations/neil` is listed before nothing else can
   * match it, and the bare `/destinations` source is exact, so the
   * `/destinations/<slug>` pages are untouched by it.
   */
  async redirects() {
    return [
      // A legacy spelling of Neil that predates the `neil-island` slug, and
      // the shape a person guesses. The page itself is `dynamicParams: false`,
      // so without this it is a 404 rather than a near miss.
      {
        source: "/destinations/neil",
        destination: "/destinations/neil-island",
        permanent: true,
      },
      /*
        `/destinations` and `/how-it-works` point at the HOMEPAGE, not at
        `/explore`. Both sections lived on `/explore` until 2026-08-07 and were
        removed as duplicates of the homepage's own — so these redirects follow
        the content rather than the URL that used to hold it. `#destinations`
        is `FirstLaunch` and `#how` is the why act; both ids are asserted by
        the e2e suite precisely because a redirect that lands on a missing
        anchor silently drops the reader at the top of a long page.
      */
      {
        source: "/destinations",
        destination: "/#destinations",
        permanent: false,
      },
      { source: "/how-it-works", destination: "/#how", permanent: false },
      { source: "/travellers", destination: "/explore", permanent: false },
      {
        source: "/experiences",
        destination: "/explore#experiences",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
