import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";
import { buttonVariants } from "@/components/ui/button";
import { SiteFooter } from "@/components/site/site-footer";
import { ExperienceCard } from "@/components/experience/experience-card";
import { listExperiences } from "@/lib/experiences/data";

export default function HomePage() {
  const featured = listExperiences().slice(0, 3);

  return (
    <>
      <main>
        <section className="relative flex min-h-dvh flex-col overflow-hidden">
          {/* Ambient warmth — a soft terra dawn over the cream canvas. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
          >
            <div className="from-terra/15 via-terra/5 absolute top-0 left-1/2 h-[65vh] w-[130vw] -translate-x-1/2 rounded-b-[100%] bg-gradient-to-b to-transparent blur-3xl" />
          </div>

          <header className="flex items-center justify-between px-6 py-6 sm:px-10">
            <Wordmark />
            <nav className="hidden items-center gap-8 sm:flex">
              <Link
                href="/experiences"
                className="label text-forest/55 hover:text-forest transition-colors"
              >
                Experiences
              </Link>
              <Link
                href="/philosophy"
                className="label text-forest/55 hover:text-forest transition-colors"
              >
                Philosophy
              </Link>
              <Link
                href="/waitlist"
                className="label text-forest/55 hover:text-forest transition-colors"
              >
                Waitlist
              </Link>
            </nav>
          </header>

          <div className="flex flex-1 flex-col items-center justify-center px-6 pb-16 text-center">
            <p
              className="rise label text-terra"
              style={{ animationDelay: "0.05s" }}
            >
              Havelock · Andaman Islands
            </p>
            <h1
              className="rise font-display text-forest mt-6 max-w-4xl text-5xl leading-[1.04] tracking-tight sm:text-7xl"
              style={{ animationDelay: "0.15s" }}
            >
              Don&rsquo;t be a <em className="text-terra">tourist</em>.
            </h1>
            <p
              className="rise text-forest/70 mt-7 max-w-xl text-lg leading-relaxed sm:text-xl"
              style={{ animationDelay: "0.3s" }}
            >
              Immersive, participatory experiences on the water, across the
              islands and after dark — so you belong to a place, briefly, rather
              than pass through it.
            </p>
            <div
              className="rise mt-10 flex flex-col items-center gap-3 sm:flex-row"
              style={{ animationDelay: "0.45s" }}
            >
              <Link href="/waitlist" className={buttonVariants({ size: "lg" })}>
                Join the waitlist
              </Link>
              <Link
                href="/experiences"
                className={buttonVariants({ variant: "ghost", size: "lg" })}
              >
                See the experiences
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-20 sm:px-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="label text-terra">Season One</p>
              <h2 className="font-display text-forest mt-3 text-3xl sm:text-4xl">
                A few to begin with.
              </h2>
            </div>
            <Link
              href="/experiences"
              className="label text-forest/55 hover:text-forest hidden sm:block"
            >
              All experiences →
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((experience) => (
              <ExperienceCard key={experience.id} experience={experience} />
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
