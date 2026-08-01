import { INTERESTS } from "@/lib/leads/registry";

/**
 * What Yuvoy is building + the experience categories. Everything here is
 * future-facing by design: no live catalog, no named operators, no prices,
 * no ratings — those appear only when real, rights-cleared content exists.
 */
export function Building() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-6 py-20 sm:px-10">
        <div className="max-w-2xl">
          <p className="label text-terra-deep">What we&rsquo;re building</p>
          <h2 className="font-display text-teal mt-3 text-3xl sm:text-4xl">
            Experiences chosen by feeling, not by filtering.
          </h2>
          <p className="text-teal/70 mt-4 text-lg">
            Most travel sites hand you a list. Yuvoy is being built around the
            people who actually live a place — so that what you find isn&rsquo;t
            an itinerary, it&rsquo;s a way in. Discovery through real local
            perspective first; booking comes when it&rsquo;s ready, and not a
            day before.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {INTERESTS.map((interest, i) => (
            <div
              key={interest.key}
              className="border-cream-line bg-cream-deep/40 rounded-3xl border p-8"
            >
              <span className="label text-teal/75">0{i + 1}</span>
              <h3 className="font-display text-teal mt-4 text-2xl">
                {interest.label}
              </h3>
              <p className="text-teal/70 mt-2 text-sm">
                {CATEGORY_COPY[interest.key]}
              </p>
            </div>
          ))}
        </div>
        <p className="text-teal/75 mt-6 text-sm">
          Categories we&rsquo;re curating for the first season. Individual
          experiences appear once their operators are on board.
        </p>
      </section>

      <section className="bg-ink px-6 py-24 text-center sm:px-10">
        <p className="label text-terra-soft">Planned for this season</p>
        <h2 className="font-display text-cream mx-auto mt-6 max-w-3xl text-3xl leading-tight sm:text-5xl">
          Discover. Choose. <em className="text-terra-soft">Go.</em>
        </h2>
        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-8 text-left sm:grid-cols-3">
          {JOURNEY.map((step, i) => (
            <div key={step.title}>
              <span className="label text-cream/70">0{i + 1}</span>
              <h3 className="font-display text-cream mt-3 text-xl">
                {step.title}
              </h3>
              <p className="text-cream/70 mt-2 text-sm">{step.body}</p>
            </div>
          ))}
        </div>
        <p className="text-cream/70 mx-auto mt-10 max-w-xl text-sm">
          This is the journey we&rsquo;re building — not one you can take today.
          Register below and you&rsquo;ll hear from us as it opens.
        </p>
      </section>
    </>
  );
}

const CATEGORY_COPY: Record<string, string> = {
  diving_water:
    "Reefs, dives and open water — with the people who read these seas for a living.",
  boats_islands: "Island days, hidden coves and routes the ferries skip.",
  food_culture:
    "What the islands actually eat, cook and celebrate — beyond the resort menu.",
  other:
    "Nights under dark skies, forest walks, and the things that don't fit a category.",
};

const JOURNEY = [
  {
    title: "Discover",
    body: "Find experiences through real local perspective — not a search-results page.",
  },
  {
    title: "Choose",
    body: "Understand what a day actually holds — who runs it, what it needs, what it gives back.",
  },
  {
    title: "Go",
    body: "We arrange the practical details with you, so the day itself is all that's left.",
  },
];
