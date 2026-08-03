import type { Metadata } from "next";
import type { ReactNode } from "react";
import { instrumentSerif, inter, plexMono } from "@/lib/fonts";
import { Providers } from "@/components/providers";
import { SITE_URL, IS_PRODUCTION } from "@/lib/site";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ConsentBanner } from "@/components/analytics/consent-banner";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { StagingBanner } from "@/components/site/staging-banner";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Yuvoy · See the experience. Feel if it's right. Then book.",
    template: "%s · Yuvoy",
  },
  description:
    "Yuvoy brings local dives, boat days, food and culture to life through honest video from the people who run them. Join the waitlist for first access in Havelock, Neil and Port Blair.",
  applicationName: "Yuvoy",
  robots: IS_PRODUCTION ? undefined : { index: false, follow: false },
  openGraph: {
    type: "website",
    siteName: "Yuvoy",
    title: "Yuvoy · See the experience. Feel if it's right. Then book.",
    description:
      "Local dives, boat days, food and culture in the Andaman Islands, shown in honest video by the people who run them. Join the waitlist for first access.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Yuvoy · See the experience. Feel if it's right. Then book.",
    description:
      "Local experiences in the Andaman Islands, shown in honest video by the people who run them. Join the waitlist.",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${inter.variable} ${plexMono.variable} h-full`}
    >
      <body className="min-h-full">
        <a
          href="#content"
          className="focus:bg-forest focus:text-cream label rounded-edge sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-3"
        >
          Skip to content
        </a>
        <Providers>
          <div className="flex min-h-dvh flex-col">
            <SiteHeader />
            <div id="content" tabIndex={-1} className="flex-1 outline-none">
              {children}
            </div>
            <SiteFooter />
          </div>
        </Providers>
        {/*
          Speed Insights only. It is production-gated, carries no visitor
          identity or profile, and exists to verify Core Web Vitals — the
          same performance bar this rebuild is answering. Product analytics
          lives behind the consent prompt instead.
        */}
        {IS_PRODUCTION && <SpeedInsights />}
        <ConsentBanner />
        <StagingBanner />
      </body>
    </html>
  );
}
