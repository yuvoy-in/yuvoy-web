import { Play, Heart, Ticket } from "lucide-react";

const STEPS = [
  {
    icon: Play,
    label: "Watch",
    body: "Discover through film, not search — every story is a place you could be standing in.",
  },
  {
    icon: Heart,
    label: "Feel",
    body: "Let it land. The best experiences are chosen by feeling, not by filtering.",
  },
  {
    icon: Ticket,
    label: "Book",
    body: "When it's right, it's one tap away. The film you watched becomes the day you live.",
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20 sm:px-10">
      <div className="max-w-2xl">
        <p className="label text-terra">How it works</p>
        <h2 className="font-display text-forest mt-3 text-3xl sm:text-4xl">
          Watch. Feel. Book.
        </h2>
        <p className="text-forest/70 mt-4 text-lg">
          You don&rsquo;t search for an experience — you feel your way to it.
          Content becomes commerce.
        </p>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
        {STEPS.map((step, i) => (
          <div key={step.label}>
            <div className="flex items-center gap-3">
              <span className="bg-terra/10 text-terra flex size-11 items-center justify-center rounded-full">
                <step.icon className="size-5" />
              </span>
              <span className="label text-forest/40">0{i + 1}</span>
            </div>
            <h3 className="font-display text-forest mt-5 text-2xl">
              {step.label}
            </h3>
            <p className="text-forest/70 mt-2">{step.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
