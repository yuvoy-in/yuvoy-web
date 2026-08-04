import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";
import { buttonVariants } from "@/components/ui/button";
import { SiteMenu } from "@/components/site/site-menu";
import { cn } from "@/lib/cn";
import { OPERATOR_NAV, PRIMARY_CTA } from "@/lib/site/nav";

/**
 * The site header: sticky, compact, present on every route.
 *
 * It carries exactly three things — the mark, the operator link, and the call
 * to action — and every other route lives in the menu, on desktop as well as
 * on a phone. A header that lists everything makes each item worth less; this
 * one states who the site is for (travellers, by default) and where the other
 * audience should go, and lets the page do the rest.
 *
 * The layout is a three-column grid rather than a flex row with
 * `justify-between`, because the operator link has to sit at the true centre
 * of the page and not at the midpoint of whatever space the mark and the
 * button leave over.
 *
 * It stays a server component and looks identical on every route. An adaptive
 * variant that turned forest over the homepage cover and carried a reading
 * progress bar was tried and reverted (owner direction, 2026-08-03): the
 * plain bar is the one that reads as considered.
 */
export function SiteHeader() {
  return (
    <header className="border-cream-line bg-cream/85 sticky top-0 z-40 border-b backdrop-blur-md">
      <div className="container-page grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-4">
        <Link
          href="/"
          aria-label="Yuvoy home"
          className="rounded-edge justify-self-start"
        >
          <Wordmark />
        </Link>

        {/* The other audience, named once, in the middle of the page. */}
        <Link
          href={OPERATOR_NAV.href}
          className="label tap-target text-forest/75 hover:text-forest justify-self-center transition-colors duration-200"
        >
          {OPERATOR_NAV.label}
        </Link>

        <div className="flex items-center gap-2 justify-self-end">
          <Link
            href={PRIMARY_CTA.href}
            className={cn(
              buttonVariants({ size: "sm" }),
              "hidden sm:inline-flex",
            )}
          >
            {PRIMARY_CTA.label}
          </Link>
          <SiteMenu />
        </div>
      </div>
    </header>
  );
}
