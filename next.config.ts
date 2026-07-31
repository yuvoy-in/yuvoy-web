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
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  async redirects() {
    return [
      // The old waitlist page is folded into the landing's register section.
      // Provider QRs/links that carried ?audience=provider land on that tab.
      {
        source: "/waitlist",
        has: [{ type: "query", key: "audience", value: "provider" }],
        destination: "/#providers",
        permanent: true,
      },
      { source: "/waitlist", destination: "/#register", permanent: true },
    ];
  },
};

export default nextConfig;
