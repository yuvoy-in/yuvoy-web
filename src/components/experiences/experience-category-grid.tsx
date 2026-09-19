import Image from "next/image";
import { cn } from "@/lib/cn";
import type { ExperienceCategory } from "@/lib/site/experience-categories";

/**
 * Experience categories, as an editorial grid.
 *
 * ## Deliberately not links
 *
 * Four panels all pointing at the same anchor would be four repeated links to
 * a screen reader and four identical destinations to everyone else. The
 * section carries **one** call to action beneath the grid instead, which is
 * also the honest shape: there is no per-category page to go to, because
 * there is no inventory to filter.
 *
 * ## Deliberately lighter than the destination triptych
 *
 * The two sit close together on both the homepage and Explore, and if both are
 * full-bleed plates the page reads as one long wall of panels. Destinations
 * are the plates; categories are ruled type on the canvas. The difference in
 * weight is what tells a reader these are two different kinds of thing.
 *
 * `heroMedia` is optional here for the same reason it is on a destination:
 * supply an image and the panel gains a cropped strip above its type, with no
 * other change.
 */
export function ExperienceCategoryGrid({
  categories,
  /**
   * `feature` is the season's own categories, set at reading scale.
   * `quiet` is the rest of the vocabulary: present, so the site does not read
   * as a single-activity product, but visibly not what this season leads with.
   */
  scale = "feature",
  tone = "paper",
  className,
}: {
  categories: ExperienceCategory[];
  scale?: "feature" | "quiet";
  tone?: "paper" | "ink";
  className?: string;
}) {
  const dark = tone === "ink";
  const quiet = scale === "quiet";

  return (
    <ul
      className={cn(
        "grid grid-cols-1 gap-x-8 gap-y-px sm:grid-cols-2",
        quiet ? "lg:grid-cols-3" : "lg:grid-cols-4",
        className,
      )}
    >
      {categories.map((category, i) => (
        <li
          key={category.key}
          className={cn(
            "border-t pt-6",
            dark ? "border-paper/12" : "border-paper-line",
            quiet ? "sm:pr-6" : "sm:pr-8",
          )}
        >
          {category.heroMedia && !quiet && (
            <div className="relative mb-6 aspect-5/4 overflow-hidden">
              <Image
                src={category.heroMedia.src}
                alt={category.heroMedia.alt}
                fill
                quality={75}
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          )}

          {!quiet && (
            <span
              className={cn("label", dark ? "text-paper/70" : "text-forest/75")}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
          )}

          <h3
            className={cn(
              "font-display tracking-display font-normal",
              !quiet && "mt-4",
              quiet ? "text-lg" : "text-xl sm:text-2xl",
              dark ? "text-paper" : "text-forest",
            )}
          >
            {category.label}
          </h3>
          <p
            className={cn(
              "mt-3 leading-relaxed",
              quiet ? "text-sm" : "",
              dark ? "text-paper/70" : "text-forest/75",
            )}
          >
            {category.description}
          </p>
        </li>
      ))}
    </ul>
  );
}
