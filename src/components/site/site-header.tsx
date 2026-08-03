"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wordmark } from "@/components/brand/wordmark";
import { buttonVariants, ButtonArrow } from "@/components/ui/button";
import { NavLinks } from "@/components/site/nav-links";
import { MobileMenu } from "@/components/site/mobile-menu";
import { cn } from "@/lib/cn";
import { PRIMARY_CTA } from "@/lib/site/nav";

/**
 * The site header: sticky, compact, present on every route, with two
 * behaviours that make it feel considered rather than bolted on.
 *
 * 1. Over the homepage's forest cover it wears the same forest, borderless,
 *    so the top of the page reads as one uninterrupted scene; the moment the
 *    cover scrolls past it settles into the translucent cream bar every other
 *    route gets. Opaque forest rather than true transparency: the effect is
 *    identical against the flat hero top and it can never produce a
 *    half-readable in-between state.
 * 2. A terracotta hairline along its bottom edge traces reading progress.
 *
 * One passive scroll listener drives both, coalesced through a single rAF;
 * the progress bar writes a transform directly so scrolling never re-renders
 * React. SSR picks the right initial tone from the pathname, so there is no
 * first-paint flash on either kind of route.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const hasDarkCover = pathname === "/" || pathname.startsWith("/go/");
  const [overCover, setOverCover] = React.useState(hasDarkCover);
  const overCoverRef = React.useRef(overCover);
  const progressRef = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    const cover = hasDarkCover
      ? document.querySelector("[data-dark-hero]")
      : null;
    let frame = 0;

    function update() {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      progressRef.current?.style.setProperty(
        "transform",
        `scaleX(${progress})`,
      );

      const next = cover ? cover.getBoundingClientRect().bottom > 64 : false;
      if (next !== overCoverRef.current) {
        overCoverRef.current = next;
        setOverCover(next);
      }
    }

    function schedule() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [hasDarkCover, pathname]);

  const tone = overCover ? "onDark" : "onLight";

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-colors duration-300",
        overCover
          ? "bg-forest border-transparent"
          : "border-cream-line bg-cream/85 backdrop-blur-md",
      )}
    >
      <div className="container-page flex h-16 items-center justify-between gap-6">
        <Link
          href="/"
          aria-label="Yuvoy home"
          className="rounded-edge shrink-0"
        >
          <Wordmark tone={tone} />
        </Link>

        <NavLinks tone={tone} />

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={PRIMARY_CTA.href}
            className={cn(
              buttonVariants({ size: "sm" }),
              "hidden sm:inline-flex",
              overCover && "focus-visible:ring-offset-forest",
            )}
          >
            {PRIMARY_CTA.label}
            <ButtonArrow />
          </Link>
          <MobileMenu tone={tone} />
        </div>
      </div>

      {/* Reading progress: a terracotta hairline tracing the scroll. */}
      <span
        ref={progressRef}
        aria-hidden
        className="bg-terra absolute bottom-0 left-0 h-px w-full origin-left scale-x-0"
      />
    </header>
  );
}
