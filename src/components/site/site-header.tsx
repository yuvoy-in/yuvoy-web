import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";
import { buttonVariants } from "@/components/ui/button";
import { HeaderShell } from "@/components/site/header-shell";
import { SiteMenu } from "@/components/site/site-menu";
import { cn } from "@/lib/cn";
import { OPERATOR_NAV, PRIMARY_CTA } from "@/lib/site/nav";

/**
 * The site header: sticky, compact, present on every route, and out of the
 * way while you read.
 *
 * It slides up as you scroll down the page and returns the moment you scroll
 * back — the behaviour and its edge cases live in HeaderShell, which is the
 * only client component here. Everything below stays server-rendered.
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
 * It looks identical on every route. An adaptive variant that turned forest
 * over the homepage cover and carried a reading progress bar was tried and
 * reverted (owner direction, 2026-08-03): the plain bar is the one that reads
 * as considered.
 */
export function SiteHeader() {
  return (
    <HeaderShell className="border-cream-line bg-cream/85 header-slide sticky top-0 z-40 border-b backdrop-blur-md">
      <div className="container-page grid h-14 grid-cols-[1fr_auto_1fr] items-center gap-4">
        {/* `flex`, not the default: an inline-level child sits on the line
            box's baseline, and the strut reserves descender space under it.
            That dead space is inside the link, so centring the link centres
            the mark *plus* the gap and the mark rides high. */}
        <Link
          href="/"
          aria-label="Yuvoy home"
          className="rounded-edge flex items-center justify-self-start"
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
    </HeaderShell>
  );
}
