"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { NAV_ITEMS } from "@/lib/site/nav";

/**
 * Desktop primary navigation: the `inHeader` routes, inline in the bar from
 * `lg` up. Below that the shutter menu is the whole of navigation, so this
 * renders nothing there. Client-side only so the current route can carry
 * `aria-current="page"`; the header itself stays as it is.
 *
 * `tone` follows the header surface — cream text over a dark cover, forest on
 * the cream bar — the same contract as the operator link that replaces this
 * nav below `lg`.
 */
export function NavLinks({
  tone = "onLight",
}: {
  tone?: "onLight" | "onDark";
}) {
  const pathname = usePathname();
  if (NAV_ITEMS.length === 0) return null;

  return (
    <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
      {NAV_ITEMS.map((item) => {
        const current =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={current ? "page" : undefined}
            className={cn(
              "label tap-target transition-colors duration-300",
              tone === "onDark"
                ? current
                  ? "text-cream"
                  : "text-cream/75 hover:text-cream"
                : current
                  ? "text-terra-deep"
                  : "text-forest/75 hover:text-forest",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
