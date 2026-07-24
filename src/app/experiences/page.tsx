import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { ExperienceCard } from "@/components/experience/experience-card";
import { listExperiences } from "@/lib/experiences/data";

export const metadata: Metadata = {
  title: "Experiences",
  description:
    "A curated collection of immersive experiences in the Andaman Islands — on the water, across the islands and after dark.",
};

export default function ExperiencesPage() {
  const experiences = listExperiences();
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
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {experiences.map((experience) => (
            <ExperienceCard key={experience.id} experience={experience} />
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
