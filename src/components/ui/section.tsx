import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * A section is light or it is dark. `ink` is the name of the *tone*; `forest`
 * is the colour it paints. The site briefly carried two darks and the second
 * one was read as a mistake wherever it appeared, so there is exactly one, and
 * no third option to reach for.
 */
type Tone = "paper" | "ink";

const SURFACE: Record<Tone, string> = {
  paper: "bg-paper text-forest",
  ink: "bg-forest text-paper",
};

/** Accent colour that clears AA against each surface. */
const ACCENT: Record<Tone, string> = {
  paper: "text-terra",
  ink: "text-terra-soft",
};

const EYEBROW: Record<Tone, string> = {
  paper: "text-terra-deep",
  ink: "text-terra-soft",
};

const BODY: Record<Tone, string> = {
  paper: "text-forest/75",
  ink: "text-paper/70",
};

/**
 * A full-width page section, on paper or on forest.
 *
 * Sections alternate light and dark down a page — that rhythm is what makes
 * long editorial pages readable, so prefer alternating over stacking two of
 * the same tone.
 */
export function Section({
  tone = "paper",
  id,
  className,
  backdrop,
  children,
  ...rest
}: {
  tone?: Tone;
  id?: string;
  className?: string;
  /**
   * A full-bleed decorative layer painted behind the section's measure —
   * artwork, a scrim, grain. It escapes `container-page`, which the children
   * cannot, and it is why this is a slot rather than just another child.
   *
   * The caller owns the layers and is responsible for making them inert:
   * `aria-hidden`, `pointer-events-none`, and `absolute inset-0` inside it.
   * `isolate` here plus `-z-10` there is the pairing the footer already uses
   * — it puts the backdrop behind the content without giving any child its
   * own stacking context to escape into.
   *
   * **A backdrop does not relax the contrast floors.** Text still sits on a
   * measured pairing, which means the scrim's job is to make the composite
   * safe at its worst pixel rather than at its average one (see
   * `launch-field` in globals.css for how that is measured).
   */
  backdrop?: ReactNode;
  children: ReactNode;
} & Omit<React.HTMLAttributes<HTMLElement>, "className" | "id" | "children">) {
  return (
    <section
      id={id}
      className={cn(
        SURFACE[tone],
        "scroll-mt-[calc(4rem+env(safe-area-inset-top))]",
        backdrop && "relative isolate overflow-hidden",
        className,
      )}
      {...rest}
    >
      {backdrop}
      {/*
        The section's own rhythm, and the one place the mobile step is set.

        `py-20` (80px) was a desktop measure a phone inherited unchanged. On a
        1440px page 80px of air above a section is a fifth of the measure; on a
        342px column it is a quarter of the screen, spent twice per act. Across
        the homepage's six sections that alone was ~290px of scroll — and the
        reported problem is that a phone scrolls too far to reach the content
        (owner report, 2026-08-09: "good on desktop, but on mobile people feel
        they need to scroll a lot to actually know the content").

        56px still separates two acts unambiguously at this measure, which is
        the job. Nothing changes from `sm` up, so the desktop page this
        feedback did NOT complain about is untouched — that constraint is what
        makes every mobile step in this change safe to make.
      */}
      <div className="container-page py-14 sm:py-28">{children}</div>
    </section>
  );
}

/**
 * The section opener: an eyebrow, then a headline whose second thought turns
 * italic terracotta. That turn is the brand's signature typographic move —
 * one per section, never more. Since v2.5 it is a TRUE italic (Fraunces
 * ships a drawn italic file) at `font-turn`, 80 above the upright.
 *
 * `title` is the plain first line; `accent` is the italic turn. Both render
 * inside a single `<h2>` so the heading reads as one string to assistive
 * tech and to search engines.
 */
export function SectionHeading({
  eyebrow,
  title,
  accent,
  body,
  tone = "paper",
  level = 2,
  id,
  className,
}: {
  eyebrow?: string;
  title: string;
  accent?: string;
  body?: ReactNode;
  tone?: Tone;
  level?: 1 | 2;
  id?: string;
  className?: string;
}) {
  const Heading = level === 1 ? "h1" : "h2";
  return (
    <div className={cn("max-w-3xl", className)}>
      {eyebrow && <p className={cn("eyebrow", EYEBROW[tone])}>{eyebrow}</p>}
      {/*
        v2.5: display type is Fraunces at 400, the owner-picked light weight;
        the axes (opsz/SOFT/WONK) ride the `font-display` utility. The turn
        is a true italic at `font-turn` (480) — the variable file renders
        the exact weight.
      */}
      <Heading
        id={id}
        className={cn(
          "font-display tracking-display mt-4 font-normal text-balance sm:mt-6",
          level === 1
            ? "text-[clamp(2.5rem,7vw,4.5rem)] leading-none"
            : "text-[clamp(2.125rem,5vw,3.375rem)] leading-[1.04]",
        )}
      >
        {title}
        {accent && (
          <>
            {" "}
            <em className={cn("font-turn italic", ACCENT[tone])}>{accent}</em>
          </>
        )}
      </Heading>
      {/*
        `text-base` on a phone, `text-lg` from `sm`.

        18px is the right size for this lede on a wide measure and the wrong
        one on a 342px column: it fits ~38 characters to the line, so a
        two-sentence intro runs to four or five lines and the section's actual
        content is pushed a screen further down. At 16px the same sentence
        takes ~43 characters — closer to a readable measure, not further from
        it — and it matches every other paragraph on the page, which carries
        no size class at all and has always been 16px. The 18px lede was the
        outlier on a phone, not the standard.

        Display sizes are deliberately NOT touched here or anywhere in this
        change: the headline scale is owner-settled (Brand Kit v2.5, six
        weights and seven review rounds), the reported problem is length
        rather than size, and shrinking headlines to buy height is exactly
        how a page starts reading as cramped.
      */}
      {body && (
        <div
          className={cn("mt-5 leading-relaxed sm:mt-6 sm:text-lg", BODY[tone])}
        >
          {body}
        </div>
      )}
    </div>
  );
}
