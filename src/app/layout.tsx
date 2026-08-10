import type { Metadata, Viewport } from "next";
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
  Without an explicit theme-color, Safari tints its tab and URL chrome by
  sampling the page's top pixels — which, while the brand veil plays, are
  forest, so the chrome went green and then disagreed with the cream page
  underneath (owner report, 2026-08-06). Pinned to the canvas token
  `cream` (#F4EFE4 in globals.css @theme; a literal here because metadata
  cannot read CSS variables — the OG frame does the same).
*/
export const viewport: Viewport = {
  themeColor: "#f4efe4",
  /*
    Own the notch, deterministically.

    Without `viewport-fit=cover`, iOS Safari decides for itself when a page
    extends under the Dynamic Island: edge-to-edge while its chrome is
    collapsed at the top of the page, then an opaque theme-colour bar once
    scrolled. On `/` that flipped between the forest cover bleeding under the
    island and a cream band capping it — two different treatments of the same
    edge in one scroll, either of which can collide the header's lockup with
    the clock (owner report, 2026-08-11, iPhone Safari).

    `cover` removes the heuristic: the page always extends under the island,
    and — the actual point — `env(safe-area-inset-*)` stops being zero, which
    is what lets the header, the covers, the menu and every fixed element
    position around the sensor housing instead of underneath it. Every one of
    those offsets is written as `max(<the old value>, env(...))` or
    `calc(<the old value> + env(...))`, so on hardware without insets the
    layout is byte-for-byte what it was.
  */
  viewportFit: "cover",
};

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
