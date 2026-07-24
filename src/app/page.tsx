import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";
import { buttonVariants } from "@/components/ui/button";
import { SiteFooter } from "@/components/site/site-footer";
import { ExperienceCard } from "@/components/experience/experience-card";
import { HowItWorks } from "@/components/home/how-it-works";
import { listExperiences } from "@/lib/experiences/data";
import { cn } from "@/lib/cn";

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
            <div className="from-terra/15 via-terra/5 absolute top-0 left-1/2 h-[65vh] w-[130vw] -translate-x-1/2 rounded-b-[100%] bg-linear-to-b to-transparent blur-3xl" />
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
                href="/journal"
                className="label text-forest/55 hover:text-forest transition-colors"
              >
                Journal
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

        <HowItWorks />

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

        <section className="bg-midnight px-6 py-24 text-center sm:px-10">
          <p className="label text-terra">Our philosophy</p>
          <h2 className="font-display text-cream mx-auto mt-6 max-w-3xl text-3xl leading-tight italic sm:text-5xl">
            Every person and place you pass is living a life as full and vivid
            as your own.
          </h2>
          <Link
            href="/philosophy"
            className={cn(
              buttonVariants({ variant: "accent", size: "lg" }),
              "mt-8",
            )}
          >
            Read the philosophy
          </Link>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-20 sm:px-10">
          <div className="border-cream-line bg-cream-deep/40 flex flex-col items-start gap-6 rounded-3xl border p-10 sm:flex-row sm:items-center sm:justify-between sm:p-14">
            <div className="max-w-lg">
              <p className="label text-terra">For hosts</p>
              <h2 className="font-display text-forest mt-3 text-2xl sm:text-3xl">
                Create experiences with Yuvoy.
              </h2>
              <p className="text-forest/70 mt-3">
                If you know a place because you live it, we&rsquo;d love to
                build something with you — from a single dive to a day in the
                life of the islands.
              </p>
            </div>
            <Link href="/waitlist" className={buttonVariants({ size: "lg" })}>
              Become a host
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
