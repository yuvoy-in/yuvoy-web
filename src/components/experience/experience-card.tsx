import Link from "next/link";
import { MapPin, Clock, Star } from "lucide-react";
import type { ExperienceSummary } from "@/lib/api/types";
import { CATEGORY_META } from "@/lib/experiences/category";
import { formatMoney, formatDuration } from "@/lib/format";
import { cn } from "@/lib/cn";

export function ExperienceCard({
  experience,
}: {
  experience: ExperienceSummary;
}) {
  const meta = CATEGORY_META[experience.category];
  return (
    <Link
      href={`/experiences/${experience.slug}`}
      className="border-cream-line bg-cream-deep/40 hover:border-forest/25 group flex flex-col overflow-hidden rounded-3xl border transition-all hover:-translate-y-0.5"
    >
      <div
        className={cn("relative aspect-[4/5] bg-gradient-to-br", meta.gradient)}
      >
        <span className="label bg-cream/80 text-forest/70 absolute top-4 left-4 rounded-full px-3 py-1 backdrop-blur">
          {meta.label}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-forest text-xl leading-tight">
          {experience.title}
        </h3>
        <p className="text-forest/60 mt-2 flex items-center gap-3 text-sm">
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5" />
            {experience.location}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" />
            {formatDuration(experience.durationMinutes)}
          </span>
        </p>
        <div className="mt-auto flex items-end justify-between pt-4">
          <div>
            <span className="label text-forest/45">From</span>
            <p className="font-display text-forest text-lg">
              {formatMoney(experience.fromPrice)}
            </p>
          </div>
          <span className="text-forest/70 inline-flex items-center gap-1 text-sm">
            <Star className="fill-terra text-terra size-3.5" />
            {experience.rating.toFixed(1)}
            {experience.reviewCount != null && (
              <span className="text-forest/40">({experience.reviewCount})</span>
            )}
          </span>
        </div>
      </div>
    </Link>
  );
}
