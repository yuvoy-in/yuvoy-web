import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { ExperienceCard } from "@/components/experience/experience-card";
import { ExperienceFilterBar } from "@/components/experience/filter-bar";
import { listExperiences, experienceCategories } from "@/lib/experiences/data";
import type { Category, ExperienceMode } from "@/lib/api/types";

export const metadata: Metadata = {
  title: "Experiences",
  description:
    "A curated collection of immersive experiences in the Andaman Islands — on the water, across the islands and after dark.",
};

const CATEGORIES = experienceCategories();
const CATEGORY_SET = new Set<string>(CATEGORIES);

function parseCategory(value?: string): Category | undefined {
  return value && CATEGORY_SET.has(value) ? (value as Category) : undefined;
}
function parseMode(value?: string): ExperienceMode | undefined {
  return value === "local" || value === "travel" ? value : undefined;
}

export default async function ExperiencesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; mode?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const category = parseCategory(sp.category);
  const mode = parseMode(sp.mode);
  const experiences = listExperiences({ category, mode, q: sp.q });

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-16 sm:px-10">
        <div className="max-w-2xl">
          <p className="label text-terra">The collection</p>
          <h1 className="font-display text-forest mt-4 text-4xl leading-tight sm:text-5xl">
            On the water, across the islands, after dark.
          </h1>
          <p className="text-forest/70 mt-4 text-lg">
            Each one led by people who live these islands — anchored by our dive
            team, and growing into the wider Andamans.
          </p>
        </div>

        <div className="mt-10">
          <Suspense fallback={null}>
            <ExperienceFilterBar
              categories={CATEGORIES}
              activeCategory={category}
              activeMode={mode}
            />
          </Suspense>
        </div>

        {experiences.length > 0 ? (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {experiences.map((experience) => (
              <ExperienceCard key={experience.id} experience={experience} />
            ))}
          </div>
        ) : (
          <div className="border-cream-line bg-cream-deep/30 mt-12 rounded-3xl border py-20 text-center">
            <p className="font-display text-forest text-2xl">
              Nothing here yet.
            </p>
            <p className="text-forest/60 mt-2">
              No experiences match those filters — try clearing them.
            </p>
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
