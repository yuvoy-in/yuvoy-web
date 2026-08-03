import { Section, SectionHeading } from "@/components/ui/section";
import { Reveal } from "@/components/motion/reveal";

/**
 * Act 02 — the answer, reduced to its three moves. The product itself already
 * ran on the cover; this act slows it down. Each step carries a small UI
 * fragment — a shard of the same screen the visitor just watched — rather
 * than an icon, so the section keeps showing instead of telling.
 *
 * The fragments are static and server-rendered: echoes of the preview, not a
 * second demo. The closing caveat is owner-approved canon, quoted verbatim —
 * it is the page's clearest statement that booking does not exist yet.
 */
export function Answer() {
  return (
    <Section id="how" tone="ink" aria-labelledby="answer-heading">
      <SectionHeading
        id="answer-heading"
        tone="ink"
        eyebrow="02 — What Yuvoy does"
        title="Scroll. Watch."
        accent="Book."
        body="One feed of everything a destination offers, filmed by the people who run it — and the booking happens right where the watching does."
      />

      <ol className="border-cream/12 mt-16 grid grid-cols-1 gap-x-10 gap-y-14 border-t pt-12 md:grid-cols-3">
        <Reveal as="li">
          <SearchFragment />
          <StepText
            n="01"
            title="Search a place, not a keyword"
            body="Everything actually running there, in one feed — not ten tabs of guesswork."
          />
        </Reveal>

        <Reveal as="li" delay={0.12}>
          <WatchFragment />
          <StepText
            n="02"
            title="Watch the real thing"
            body="Operator footage, not stock photography. You know in ten seconds whether a day fits you."
          />
        </Reveal>

        <Reveal as="li" delay={0.24}>
          <BookFragment />
          <StepText
            n="03"
            title="Book without leaving"
            body="One tap, direct with the operator, confirmed on the spot."
          />
        </Reveal>
      </ol>

      <p className="border-terra-soft/40 text-cream mt-14 max-w-2xl border-l-2 py-1 pl-6 text-lg">
        Booking opens after the first curated collection is ready. The waitlist
        hears first.
      </p>
    </Section>
  );
}

function StepText({
  n,
  title,
  body,
}: {
  n: string;
  title: string;
  body: string;
}) {
  return (
    <div className="mt-6">
      <div className="flex items-baseline gap-4">
        <span className="label text-terra-soft">{n}</span>
        <h3 className="font-display text-2xl tracking-tight">{title}</h3>
      </div>
      <p className="text-cream/70 mt-3 leading-relaxed">{body}</p>
    </div>
  );
}

/* ------------------------------------------------------------- fragments */

/** A shard of the feed's search bar. */
function SearchFragment() {
  return (
    <div aria-hidden className="border-cream/12 rounded-edge border p-5">
      <div className="bg-cream/95 text-forest rounded-edge flex items-center gap-2.5 px-4 py-3 text-sm font-medium">
        <svg viewBox="0 0 20 20" fill="none" className="size-4 opacity-50">
          <circle
            cx="9"
            cy="9"
            r="6.2"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M13.6 13.6L17 17"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
        Andaman Islands
        <span className="bg-terra-deep ml-auto h-4 w-px animate-pulse" />
      </div>
      <div className="mt-3 flex gap-2">
        {["Dive", "Sea walk", "Boats", "Food"].map((chip) => (
          <span
            key={chip}
            className="border-cream/20 text-cream/70 rounded-edge border px-2.5 py-1 text-[11px]"
          >
            {chip}
          </span>
        ))}
      </div>
    </div>
  );
}

/** A shard of an experience card mid-play. */
function WatchFragment() {
  return (
    <div
      aria-hidden
      className="rounded-edge relative h-[104px] overflow-hidden"
    >
      <div className="film film-b" />
      <div className="caustics" />
      <div className="to-forest/90 absolute inset-0 bg-linear-to-b from-transparent from-30%" />
      <div className="absolute inset-x-4 bottom-3">
        <p className="text-cream/75 flex items-center gap-2 text-[10px]">
          <span className="bg-terra inline-block size-3 rounded-full" />
          Filmed by the operator
        </p>
        <p className="font-display text-cream mt-1 text-lg leading-tight">
          Walk the reef without swimming
        </p>
      </div>
    </div>
  );
}

/** A shard of the confirmation. */
function BookFragment() {
  return (
    <div
      aria-hidden
      className="border-cream/12 rounded-edge flex items-center gap-4 border p-5"
    >
      <span className="bg-terra-deep flex size-9 shrink-0 items-center justify-center rounded-full">
        <svg viewBox="0 0 20 20" fill="none" className="size-4">
          <path
            d="M4 10.5l4 4 8-8.5"
            stroke="var(--color-cream)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <div>
        <p className="font-display text-cream text-lg leading-tight">
          Seat confirmed
        </p>
        <p className="text-cream/70 mt-0.5 text-[11px]">
          Direct with the operator · no middle layer
        </p>
      </div>
    </div>
  );
}
