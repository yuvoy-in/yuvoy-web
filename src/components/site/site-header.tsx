import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";
import { buttonVariants } from "@/components/ui/button";
import { NavLinks } from "@/components/site/nav-links";
import { MobileMenu } from "@/components/site/mobile-menu";
import { cn } from "@/lib/cn";
import { PRIMARY_CTA } from "@/lib/site/nav";

/**
 * The site header: sticky, compact, present on every route.
 *
 * Deliberately short (64px) so it costs almost no viewport on scroll, and
 * translucent over a blur so long editorial pages read as one surface rather
 * than sliding under a hard bar.
 *
 * It stays a server component and looks identical on every route. An adaptive
 * variant that turned forest over the homepage cover and carried a reading
 * progress bar was tried and reverted (owner direction, 2026-08-03): the
 * plain bar is the one that reads as considered.
 */
export function SiteHeader() {
  return (
    <header className="border-cream-line bg-cream/85 sticky top-0 z-40 border-b backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-6">
        <Link
          href="/"
          aria-label="Yuvoy home"
          className="rounded-edge shrink-0"
        >
          <Wordmark />
        </Link>

        <NavLinks />

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={PRIMARY_CTA.href}
            className={cn(
              buttonVariants({ size: "sm" }),
              "hidden sm:inline-flex",
            )}
          >
            {PRIMARY_CTA.label}
          </Link>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
