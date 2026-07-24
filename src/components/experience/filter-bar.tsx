"use client";

import { useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { Category, ExperienceMode } from "@/lib/api/types";
import { CATEGORY_META } from "@/lib/experiences/category";
import { cn } from "@/lib/cn";

const MODES: { value: ExperienceMode; label: string }[] = [
  { value: "travel", label: "Travel" },
  { value: "local", label: "Local" },
];

const chip =
  "label rounded-full border px-4 py-1.5 transition-colors cursor-pointer";
const chipActive = "border-forest bg-forest text-cream";
const chipIdle = "border-cream-line text-forest/55 hover:border-forest/30";

export function ExperienceFilterBar({
  categories,
  activeCategory,
  activeMode,
}: {
  categories: Category[];
  activeCategory?: Category;
  activeMode?: ExperienceMode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        {MODES.map((m) => (
          <button
            key={m.value}
            type="button"
            aria-pressed={activeMode === m.value}
            onClick={() =>
              setParam("mode", activeMode === m.value ? null : m.value)
            }
            className={cn(chip, activeMode === m.value ? chipActive : chipIdle)}
          >
            {m.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={!activeCategory}
          onClick={() => setParam("category", null)}
          className={cn(chip, !activeCategory ? chipActive : chipIdle)}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={activeCategory === c}
            onClick={() =>
              setParam("category", activeCategory === c ? null : c)
            }
            className={cn(chip, activeCategory === c ? chipActive : chipIdle)}
          >
            {CATEGORY_META[c].label}
          </button>
        ))}
      </div>
    </div>
  );
}
