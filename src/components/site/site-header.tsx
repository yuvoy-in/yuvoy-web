"use client";

import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";
import { buttonVariants } from "@/components/ui/button";
import { SiteMenu } from "@/components/site/site-menu";
import { useHeaderChrome } from "@/components/site/use-header-chrome";
import { cn } from "@/lib/cn";
import { OPERATOR_NAV, PRIMARY_CTA } from "@/lib/site/nav";

/**
 * The site header: sticky, compact, present on every route, and out of the
 * way while you read.
 *
 * It carries exactly three things — the mark, the operator link, and the call
 * to action — and every other route lives in the menu, on desktop as well as
 * on a phone. A header that lists everything makes each item worth less; this
 * one states who the site is for (travellers, by default) and where the other
 * audience should go, and lets the page do the rest.
 *
 * Two scroll behaviours, both owned by `useHeaderChrome`: it slides up as you
 * scroll down and returns as you scroll back, and at the very top of a page
 * whose first section is a dark cover it goes transparent and turns its
 * contents cream, so the top of the homepage reads as one uninterrupted field
 * rather than a cream bar stuck on a green wall.
 *
 * The layout is a three-column grid rather than a flex row with
 * `justify-between`, because the operator link has to sit at the true centre
 * of the page and not at the midpoint of whatever space the mark and the
 * button leave over.
 */
export function SiteHeader() {
  const { ref, overCover } = useHeaderChrome();

  return (
    <header
      ref={ref}
      data-hidden="false"
      className={cn(
        "header-slide sticky top-0 z-40 border-b backdrop-blur-md",
        overCover
          ? "border-transparent bg-transparent"
          : "border-cream-line bg-cream/85",
      )}
    >
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
          <Wordmark tone={overCover ? "onDark" : "onLight"} />
        </Link>

        {/* The other audience, named once, in the middle of the page. */}
        <Link
          href={OPERATOR_NAV.href}
          className={cn(
            "label tap-target justify-self-center transition-colors duration-300",
            overCover
              ? "text-cream/75 hover:text-cream"
              : "text-forest/75 hover:text-forest",
          )}
        >
          {OPERATOR_NAV.label}
        </Link>

        <div className="flex items-center gap-2 justify-self-end">
          <Link
            href={PRIMARY_CTA.href}
            className={cn(
              buttonVariants({ size: "sm" }),
              "hidden sm:inline-flex",
              // The terracotta fill reads on both surfaces; only the ring's
              // offset has to follow what is behind it.
              overCover && "focus-visible:ring-offset-forest",
            )}
          >
            {PRIMARY_CTA.label}
          </Link>
          <SiteMenu tone={overCover ? "onDark" : "onLight"} />
        </div>
      </div>
    </header>
  );
}
