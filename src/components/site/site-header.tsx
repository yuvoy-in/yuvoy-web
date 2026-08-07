"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wordmark } from "@/components/brand/wordmark";
import { buttonVariants } from "@/components/ui/button";
import { NavLinks } from "@/components/site/nav-links";
import { SiteMenu } from "@/components/site/site-menu";
import { useHeaderChrome } from "@/components/site/use-header-chrome";
import { cn } from "@/lib/cn";
import { hidesSiteChrome, PRIMARY_CTA } from "@/lib/site/nav";

/**
 * The site header: sticky, compact, present on every route, and out of the
 * way while you read.
 *
 * ## What it names
 *
 * From `lg` up: the mark, three routes (Explore, For Operators, About) and the
 * call to action. Below `lg`: the mark and the menu trigger, and nothing else.
 *
 * The phone bar carried a centred operator link and a small waitlist button
 * until 2026-08-06. Three competing targets in 64 pixels is a toolbar, not a
 * masthead, and it left the mark fighting for the room that makes it read as a
 * mark. Both moved into the shutter menu, where the call to action is pinned
 * to the panel's foot at full size and is the most prominent thing in it —
 * one tap away rather than zero, and the header reads as a piece of print.
 *
 * ## What it does on scroll
 *
 * Two behaviours, both owned by `useHeaderChrome`: it slides up as you scroll
 * down and returns as you scroll back, and at the very top of a page whose
 * first section is a dark cover it goes transparent and turns its contents
 * cream, so the top of that page reads as one uninterrupted field rather than
 * a cream bar stuck on a green wall.
 *
 * The layout is a three-column grid rather than a flex row with
 * `justify-between`, because the centre cell — the nav on desktop — has to sit
 * at the true centre of the page and not at the midpoint of whatever space the
 * mark and the button leave over.
 *
 * ## Where it does not render
 *
 * On the routes named by `hidesSiteChrome` — today that is `/waitlist` alone,
 * which carries its own masthead (`WaitlistChrome`: the mark centred, one way
 * back, no navigation). The decision lives in the registry rather than here so
 * the two mastheads can never both render, and it is made in this component
 * rather than in the root layout because the layout is a server component and
 * has no pathname to read.
 */
export function SiteHeader() {
  const pathname = usePathname();
  // Called before the early return, always: hook order cannot depend on the
  // route. With nothing to attach `ref` to, the hook's effect no-ops.
  const { ref, overCover } = useHeaderChrome();

  if (hidesSiteChrome(pathname)) return null;

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
      <div className="container-page grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-4">
        {/*
          The mark sits on the bar's baseline, not in its middle (owner
          direction, 2026-08-07): `self-end` overrides the row's `items-center`
          for this cell alone, and `pb-1` is the optical gap — a lockup flush
          against a hairline reads as a mistake, while a few pixels of air
          reads as type set on a rule.

          The padding is 4px and not 8px because the lockup is 48px in a 63px
          bar: at `pb-2` the link stood 56px tall and the drawing landed 8px
          from the top and 9px from the bottom, which is centred with extra
          steps. The e2e assertion measures the LOCKUP's box rather than the
          link's, so it cannot be satisfied by padding that moves neither.

          `flex`, not the default: an inline-level child sits on the line box's
          baseline and the strut reserves descender space under it. That dead
          space is inside the link, so aligning the link would align the mark
          *plus* the gap, and the mark would ride high of wherever it was
          asked to sit.
        */}
        <Link
          href="/"
          aria-label="Yuvoy home"
          className="rounded-edge flex items-end self-end justify-self-start pb-1"
        >
          <Wordmark tone={overCover ? "onDark" : "onLight"} />
        </Link>

        <div className="justify-self-center">
          <NavLinks tone={overCover ? "onDark" : "onLight"} />
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
              // Desktop only. Below `lg` the menu carries it, at full size.
              "hidden lg:inline-flex",
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
