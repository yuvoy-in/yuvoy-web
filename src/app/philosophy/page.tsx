import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "Philosophy",
  description:
    "Sonder — the awareness that every person and place around you is living a life as full and vivid as your own. Don't be a tourist.",
};

const BELIEFS = [
  {
    title: "Participant, not spectator",
    body: "You join the life of a place, not the sidelines of it.",
  },
  {
    title: "The place as it actually is",
    body: "Honest and rooted — never a brochure version.",
  },
  {
    title: "Premium through intimacy and craft",
    body: "Quiet, considered and personal — not flashy.",
  },
  {
    title: "Earned, not borrowed",
    body: "We tell stories from a place we genuinely operate in.",
  },
];

export default function PhilosophyPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="mx-auto max-w-3xl px-6 py-20 text-center sm:px-10 sm:py-28">
          <p className="label text-terra">Our philosophy</p>
          <h1 className="font-display text-forest mt-6 text-4xl leading-tight italic sm:text-6xl">
            “To Yuvoy” — to enter a place not as a tourist, but as a temporary
            participant in its actual life.
          </h1>
        </section>

        <section className="text-forest/75 mx-auto max-w-2xl space-y-6 px-6 pb-16 text-lg leading-relaxed sm:px-10">
          <p>
            Our emotional foundation is <em className="text-forest">sonder</em>{" "}
            — the awareness that every person and place around you is living a
            life as full and vivid as your own.
          </p>
          <p>
            The Andamans are not a backdrop for us; they are somewhere people
            live, work and belong. Our promise is to let you step into that life
            rather than watch it from the outside.
          </p>
        </section>

        <section className="mx-auto max-w-4xl px-6 pb-24 sm:px-10">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {BELIEFS.map((belief) => (
              <div
                key={belief.title}
                className="border-cream-line bg-cream-deep/40 rounded-3xl border p-7"
              >
                <h3 className="font-display text-forest text-xl">
                  {belief.title}
                </h3>
                <p className="text-forest/70 mt-2">{belief.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-midnight px-6 py-24 text-center sm:px-10">
          <h2 className="font-display text-cream mx-auto max-w-2xl text-3xl leading-tight italic sm:text-5xl">
            Don&rsquo;t be a tourist.
          </h2>
          <Link
            href="/waitlist"
            className={cn(
              buttonVariants({ variant: "accent", size: "lg" }),
              "mt-8",
            )}
          >
            Join the waitlist
          </Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
