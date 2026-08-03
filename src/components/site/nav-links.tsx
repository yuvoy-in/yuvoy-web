"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { NAV_ITEMS } from "@/lib/site/nav";

/**
 * Desktop primary navigation. Client-side only so the current route can carry
 * `aria-current="page"`. `tone` follows the header surface it sits on.
 */
export function NavLinks({
  tone = "onLight",
}: {
  tone?: "onLight" | "onDark";
}) {
  const pathname = usePathname();
  if (NAV_ITEMS.length === 0) return null;
  const onDark = tone === "onDark";

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
              "label tap-target transition-colors duration-200",
              current
                ? onDark
                  ? "text-terra-soft"
                  : "text-terra-deep"
                : onDark
                  ? "text-cream/70 hover:text-cream"
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
