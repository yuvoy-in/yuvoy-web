import type { Metadata, Viewport } from "next";
import { VIEWPORT_ON_CREAM } from "@/lib/site/theme";
import type { ReactNode } from "react";
import { dancingScript, fraunces, satoshi } from "@/lib/fonts";
import { BrandIntro } from "@/components/brand/brand-intro";
import { Providers } from "@/components/providers";
import { SITE_URL, IS_PRODUCTION } from "@/lib/site";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ConsentBanner } from "@/components/analytics/consent-banner";
import { SiteHeader } from "@/components/site/site-header";
import { NavigationHistory } from "@/components/site/navigation-history";
import { SiteFooter } from "@/components/site/site-footer";
import { StagingBanner } from "@/components/site/staging-banner";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  /*
    The template appends " · Yuvoy" to every page title, so a page's own
    `title` must never repeat the brand. The default (the homepage's) carries
    the whole positioning in one line, because it is the one result most
    people will see.
  */
  title: {
    default: "Yuvoy · Discover real experiences through video",
    template: "%s · Yuvoy",
  },
  description:
    "Discover real-world experiences through videos from the people who run them. Yuvoy is opening first in the Andaman Islands.",
  applicationName: "Yuvoy",
  robots: IS_PRODUCTION ? undefined : { index: false, follow: false },
  openGraph: {
    type: "website",
    siteName: "Yuvoy",
    title: "Yuvoy · Discover real experiences through video",
    description:
      "Discover real-world experiences through videos from the people who run them. Yuvoy is opening first in the Andaman Islands.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Yuvoy · Discover real experiences through video",
    description:
      "Discover real-world experiences through videos from the people who run them. Yuvoy is opening first in the Andaman Islands.",
  },
};

/*
  The default chrome: cream, matching the canvas. Routes that open on a
  forest cover export VIEWPORT_ON_FOREST themselves — Safari's top glass
  follows theme-color, so each route's chrome has to agree with its first
  surface. The full story, the measured iOS behaviour and the sampling bug
  this replaces are documented once, in lib/site/theme.ts.
*/
export const viewport: Viewport = VIEWPORT_ON_CREAM;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      /*
        Declares the `scroll-behavior: smooth` set in globals.css. Without it
        Next warns, and more to the point it cannot suppress the smooth scroll
        on a route change — every navigation would glide to the top of the new
        page instead of arriving at it.
      */
      data-scroll-behavior="smooth"
      className={`${fraunces.variable} ${satoshi.variable} ${dancingScript.variable} h-full`}
    >
      <body className="min-h-full">
        {/*
          First in the body so the veil and its pre-paint decision script are
          parsed before anything else can paint on a slow connection. Its
          z-order, not this source position, is what puts it above the fixed
          banners. It renders nothing for repeat visits, reduced motion, or
          JavaScript off.
        */}
        <BrandIntro />
        <a
          href="#content"
          className="focus:bg-forest focus:text-cream label rounded-edge sr-only focus:not-sr-only focus:absolute focus:top-[max(1rem,env(safe-area-inset-top))] focus:left-4 focus:z-50 focus:px-4 focus:py-3"
        >
          Skip to content
        </a>
        {/* Renders nothing. It records that the router has moved during this
            visit, which is the only reliable way a back control can tell "there
            is a page of ours behind me" from "this is where the visit began".
            See navigation-history.tsx. */}
        <NavigationHistory />
        <Providers>
          <div className="flex min-h-svh flex-col">
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
