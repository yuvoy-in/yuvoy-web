import Link from "next/link";
import { buttonVariants, ButtonArrow } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import type { Journey } from "@/lib/site/journeys";

/**
 * One audience's journey, rendered as its own visually self-contained track.
 *
 * The two journeys are never interleaved: a traveller and an operator arrive
 * with completely different questions, and mixing the answers serves neither.
 *
 * Every step carries a visible status chip. "Planned" is not decoration — it
 * is the page's load-bearing honesty, and it is why a page describing payment
 * and payouts cannot be mistaken for a page offering them.
 */
export function JourneyTrack({ journey }: { journey: Journey }) {
  const headingId = `journey-${journey.key}`;
  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        "scroll-mt-14",
        journey.key === "operator"
          ? "bg-forest text-cream"
          : "bg-cream text-forest",
      )}
      id={journey.key === "operator" ? "operators" : "travellers"}
    >
      <div className="container-page py-20 sm:py-28">
        <p
          className={cn(
            "eyebrow",
            journey.key === "operator" ? "text-terra-soft" : "text-terra-deep",
          )}
        >
          {journey.audience}
        </p>
        <h2
          id={headingId}
          className="font-display mt-6 max-w-3xl text-[clamp(1.875rem,4.5vw,3rem)] leading-[1.05] font-medium tracking-tight text-balance"
        >
          {journey.title}{" "}
          <em
            className={cn(
              "font-bold not-italic",
              journey.key === "operator" ? "text-terra-soft" : "text-terra",
            )}
          >
            {journey.accent}
          </em>
        </h2>
        <p
          className={cn(
            "mt-6 max-w-2xl text-lg leading-relaxed",
            journey.key === "operator" ? "text-cream/70" : "text-forest/75",
          )}
        >
          {journey.lede}
        </p>

        <ol
          className={cn(
            "mt-14 border-t",
            journey.key === "operator"
              ? "border-cream/12"
              : "border-cream-line",
          )}
        >
          {journey.steps.map((step, i) => (
            <li
              key={step.title}
              className={cn(
                "grid grid-cols-1 gap-x-8 gap-y-3 border-b py-7 sm:grid-cols-12",
                journey.key === "operator"
                  ? "border-cream/12"
                  : "border-cream-line",
              )}
            >
              <div className="flex items-center gap-4 sm:col-span-3">
                <span
                  className={cn(
                    "label",
                    journey.key === "operator"
                      ? "text-cream/60"
                      : "text-forest/75",
                  )}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <StatusChip status={step.status} tone={journey.key} />
              </div>
              <div className="sm:col-span-9">
                <h3 className="font-display text-lg font-medium tracking-tight">
                  {step.title}
                </h3>
                <p
                  className={cn(
                    "mt-2 leading-relaxed",
                    journey.key === "operator"
                      ? "text-cream/70"
                      : "text-forest/75",
                  )}
                >
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <Link
          href={journey.cta.href}
          className={cn(
            buttonVariants({
              variant: journey.key === "operator" ? "paper" : "primary",
              size: "lg",
            }),
            "mt-12 flex w-full sm:inline-flex sm:w-auto",
          )}
        >
          {journey.cta.label}
          <ButtonArrow />
        </Link>
      </div>
    </section>
  );
}

function StatusChip({
  status,
  tone,
}: {
  status: "now" | "planned";
  tone: "traveller" | "operator";
}) {
  const onDark = tone === "operator";
  if (status === "now") {
    return (
      <span
        className={cn(
          "label rounded-edge border px-2 py-1",
          onDark
            ? "border-terra-soft/50 text-terra-soft"
            : "border-terra-deep/50 text-terra-deep",
        )}
      >
        Open now
      </span>
    );
  }
  return (
    <span
      className={cn(
        "label rounded-edge border px-2 py-1",
        onDark
          ? "border-cream/25 text-cream/60"
          : "border-forest/25 text-forest/75",
      )}
    >
      Planned
    </span>
  );
}
