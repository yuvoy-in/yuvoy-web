"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { NAV_ITEMS } from "@/lib/site/nav";

/**
 * Desktop primary navigation. Client-side only so the current route can carry
 * `aria-current="page"` — the rest of the header stays a server component.
 */
export function NavLinks() {
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
              "label tap-target transition-colors duration-200",
              current ? "text-terra-deep" : "text-teal/75 hover:text-teal",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
