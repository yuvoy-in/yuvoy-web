import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * A section is light or it is dark. `ink` is the name of the *tone*; `forest`
 * is the colour it paints. The site briefly carried two darks and the second
 * one was read as a mistake wherever it appeared, so there is exactly one, and
 * no third option to reach for.
 */
type Tone = "cream" | "ink";

const SURFACE: Record<Tone, string> = {
  cream: "bg-cream text-forest",
  ink: "bg-forest text-cream",
};

/** Accent colour that clears AA against each surface. */
const ACCENT: Record<Tone, string> = {
  cream: "text-terra",
  ink: "text-terra-soft",
};

const EYEBROW: Record<Tone, string> = {
  cream: "text-terra-deep",
  ink: "text-terra-soft",
};

const BODY: Record<Tone, string> = {
  cream: "text-forest/75",
  ink: "text-cream/70",
};

/**
 * A full-width page section, on cream or on forest.
 *
 * Sections alternate light and dark down a page — that rhythm is what makes
 * long editorial pages readable, so prefer alternating over stacking two of
 * the same tone.
 */
export function Section({
  tone = "cream",
  id,
  className,
  children,
  ...rest
}: {
  tone?: Tone;
  id?: string;
  className?: string;
  children: ReactNode;
} & Omit<React.HTMLAttributes<HTMLElement>, "className" | "id" | "children">) {
  return (
    <section
      id={id}
      className={cn(SURFACE[tone], "scroll-mt-14", className)}
      {...rest}
    >
      <div className="container-page py-20 sm:py-28">{children}</div>
    </section>
  );
}

/**
 * The section opener: an eyebrow, then a headline whose second thought turns
 * bold terracotta. That turn is the brand's signature typographic move — one
 * per section, never more. It is weight and colour in the same family (v2.3),
 * never an italic: the system ships no italic files.
 *
 * `title` is the plain first line; `accent` is the bold turn. Both render
 * inside a single `<h2>` so the heading reads as one string to assistive
 * tech and to search engines.
 */
export function SectionHeading({
  eyebrow,
  title,
  accent,
  body,
  tone = "cream",
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
        v2.3: display type is the grotesque at medium (500) — the face's
        comfortable reading weight — with 700 reserved for the turn. There is
        no 400 display file, so `font-medium` states what actually renders.
      */}
      <Heading
        id={id}
        className={cn(
          "font-display mt-6 font-medium tracking-tight text-balance",
          level === 1
            ? "text-[clamp(2.5rem,7vw,4.5rem)] leading-none"
            : "text-[clamp(2.125rem,5vw,3.375rem)] leading-[1.04]",
        )}
      >
        {title}
        {accent && (
          <>
            {" "}
            <em className={cn("font-bold not-italic", ACCENT[tone])}>
              {accent}
            </em>
          </>
        )}
      </Heading>
      {body && (
        <div className={cn("mt-6 text-lg leading-relaxed", BODY[tone])}>
          {body}
        </div>
      )}
    </div>
  );
}
