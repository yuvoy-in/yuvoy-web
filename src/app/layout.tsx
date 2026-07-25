import type { Metadata } from "next";
import type { ReactNode } from "react";
import { fraunces, inter } from "@/lib/fonts";
import { Providers } from "@/components/providers";
import { SITE_URL } from "@/lib/site";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Yuvoy — Experience More.",
    template: "%s · Yuvoy",
  },
  description:
    "Don't be a tourist. Yuvoy designs immersive, participatory experiences in the Andaman Islands — so you belong to a place, briefly, rather than pass through it.",
  applicationName: "Yuvoy",
  openGraph: {
    type: "website",
    siteName: "Yuvoy",
    title: "Yuvoy — Experience More.",
    description:
      "Immersive, participatory experiences in the Andaman Islands. Don't be a tourist.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Yuvoy — Experience More.",
    description: "Immersive experiences in the Andaman Islands.",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable} h-full`}>
      <body className="min-h-full">
        <a
          href="#content"
          className="focus:bg-forest focus:text-cream sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:px-4 focus:py-2"
        >
          Skip to content
        </a>
        <Providers>
          <div id="content" tabIndex={-1} className="outline-none">
            {children}
          </div>
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
