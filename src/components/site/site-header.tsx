"use client";

import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";
import { buttonVariants } from "@/components/ui/button";
import { NavLinks } from "@/components/site/nav-links";
import { SiteMenu } from "@/components/site/site-menu";
import { useHeaderChrome } from "@/components/site/use-header-chrome";
import { cn } from "@/lib/cn";
import { OPERATOR_NAV, PRIMARY_CTA } from "@/lib/site/nav";

/**
 * The site header: sticky, compact, present on every route, and out of the
 * way while you read.
 *
 * From `lg` up it lists the primary routes inline — a desktop has the room,
 * and a nav you can see beats one behind a click (owner direction 2026-08-05,
 * reverting the desktop-menu concept). Below `lg` it carries exactly three
 * things — the mark, the operator link, and the call to action — and every
 * other route lives in the shutter menu, whose trigger only exists there.
 *
 * Two scroll behaviours, both owned by `useHeaderChrome`: it slides up as you
 * scroll down and returns as you scroll back, and at the very top of a page
 * whose first section is a dark cover it goes transparent and turns its
 * contents cream, so the top of the homepage reads as one uninterrupted field
 * rather than a cream bar stuck on a green wall.
 *
 * The layout is a three-column grid rather than a flex row with
 * `justify-between`, because the centre cell — the nav on desktop, the
 * operator link below it — has to sit at the true centre of the page and not
 * at the midpoint of whatever space the mark and the button leave over.
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

        <div className="justify-self-center">
          <NavLinks tone={overCover ? "onDark" : "onLight"} />

          {/* Below `lg` the centre names the other audience, once. */}
          <Link
            href={OPERATOR_NAV.href}
            className={cn(
              "label tap-target transition-colors duration-300 lg:hidden",
              overCover
                ? "text-cream/75 hover:text-cream"
                : "text-forest/75 hover:text-forest",
            )}
          >
            {OPERATOR_NAV.label}
          </Link>
        </div>

        <div className="flex items-center gap-2 justify-self-end">
          <Link
            href={PRIMARY_CTA.href}
            className={cn(
              // Monochrome CTAs swap grounds with the bar: paper over the
              // dark cover, forest on the cream bar.
              buttonVariants({
                variant: overCover ? "paper" : "primary",
                size: "sm",
              }),
              "hidden sm:inline-flex",
            )}
          >
            {PRIMARY_CTA.label}
          </Link>
          <SiteMenu
            tone={overCover ? "onDark" : "onLight"}
            className="lg:hidden"
          />
        </div>
      </div>
    </header>
  );
}
