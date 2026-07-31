import type { Metadata } from "next";
import type { ReactNode } from "react";
import { fraunces, inter } from "@/lib/fonts";
import { Providers } from "@/components/providers";
import { SITE_URL, IS_PRODUCTION } from "@/lib/site";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { StagingBanner } from "@/components/site/staging-banner";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Yuvoy — Don't be a tourist.",
    template: "%s · Yuvoy",
  },
  description:
    "Yuvoy is building a marketplace for real local experiences — opening this season in the Andaman Islands, designed for the world. Register interest as a traveller or an experience provider.",
  applicationName: "Yuvoy",
  robots: IS_PRODUCTION ? undefined : { index: false, follow: false },
  openGraph: {
    type: "website",
    siteName: "Yuvoy",
    title: "Yuvoy — Don't be a tourist.",
    description:
      "Real local experiences, starting in the Andaman Islands this season. Register interest as a traveller or a provider.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Yuvoy — Don't be a tourist.",
    description:
      "Real local experiences, starting in the Andaman Islands this season.",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable} h-full`}>
      <body className="min-h-full">
        <a
          href="#content"
          className="focus:bg-teal focus:text-cream sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:px-4 focus:py-2"
        >
          Skip to content
        </a>
        <Providers>
          <div id="content" tabIndex={-1} className="outline-none">
            {children}
          </div>
        </Providers>
        <Analytics />
        {IS_PRODUCTION && <SpeedInsights />}
        <StagingBanner />
      </body>
    </html>
  );
}
