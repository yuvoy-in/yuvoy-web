import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { buttonVariants } from "@/components/ui/button";
import { getExperience, experienceSlugs } from "@/lib/experiences/data";
import { CATEGORY_META } from "@/lib/experiences/category";
import { formatMoney, formatDuration } from "@/lib/format";
import { cn } from "@/lib/cn";

export function generateStaticParams() {
  return experienceSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const experience = getExperience(slug);
  if (!experience) return { title: "Experience not found" };
  return { title: experience.title, description: experience.summary };
}

export default async function ExperienceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const experience = getExperience(slug);
  if (!experience) notFound();
  const meta = CATEGORY_META[experience.category];

  return (
    <>
      <SiteHeader />
      <main>
        <div
          className={cn(
            "relative flex min-h-[42vh] items-end bg-gradient-to-br",
            meta.gradient,
          )}
        >
          <div className="mx-auto w-full max-w-4xl px-6 py-10 sm:px-10">
            <p className="label text-forest/60">
              {meta.label} · {experience.location}
            </p>
            <h1 className="font-display text-forest mt-3 text-4xl leading-tight sm:text-6xl">
              {experience.title}
            </h1>
          </div>
        </div>

        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-10 px-6 py-12 sm:px-10 lg:grid-cols-[1fr_320px]">
          <article className="space-y-8">
            <p className="text-forest/80 text-xl leading-relaxed">
              {experience.summary}
            </p>
            <p className="text-forest/70 leading-relaxed">
              {experience.description}
            </p>

            {experience.highlights && experience.highlights.length > 0 && (
              <section>
                <h2 className="label text-forest/50">Highlights</h2>
                <ul className="mt-3 space-y-2">
                  {experience.highlights.map((h) => (
                    <li key={h} className="text-forest/80 flex gap-3">
                      <span className="text-terra">—</span>
                      {h}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {experience.included && experience.included.length > 0 && (
              <section>
                <h2 className="label text-forest/50">What&rsquo;s included</h2>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {experience.included.map((i) => (
                    <li
                      key={i}
                      className="border-cream-line bg-cream-deep text-forest/75 rounded-full border px-4 py-1.5 text-sm"
                    >
                      {i}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </article>

          <aside className="border-cream-line bg-cream-deep/50 h-fit rounded-3xl border p-6 lg:sticky lg:top-24">
            <span className="label text-forest/45">From</span>
            <p className="font-display text-forest text-3xl">
              {formatMoney(experience.fromPrice)}
            </p>
            <dl className="text-forest/70 mt-5 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt>Duration</dt>
                <dd>{formatDuration(experience.durationMinutes)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Rating</dt>
                <dd>
                  ★ {experience.rating.toFixed(1)}
                  {experience.reviewCount != null &&
                    ` (${experience.reviewCount})`}
                </dd>
              </div>
              {experience.maxGroupSize != null && (
                <div className="flex justify-between">
                  <dt>Group size</dt>
                  <dd>Up to {experience.maxGroupSize}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt>Host</dt>
                <dd>{experience.provider.name}</dd>
              </div>
            </dl>
            <Link
              href="/waitlist"
              className={cn(buttonVariants({ size: "lg" }), "mt-6 w-full")}
            >
              Request to book
            </Link>
            <p className="text-forest/45 mt-3 text-center text-xs">
              Bookings open October 2026
            </p>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
