import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "cream" | "teal" | "ink";

const SURFACE: Record<Tone, string> = {
  cream: "bg-cream text-teal",
  teal: "bg-teal text-cream",
  ink: "bg-ink text-cream",
};

/** Accent colour that clears AA against each surface. */
const ACCENT: Record<Tone, string> = {
  cream: "text-terra",
  teal: "text-terra-soft",
  ink: "text-terra-soft",
};

const EYEBROW: Record<Tone, string> = {
  cream: "text-terra-deep",
  teal: "text-terra-soft",
  ink: "text-terra-soft",
};

const BODY: Record<Tone, string> = {
  cream: "text-teal/75",
  teal: "text-cream/70",
  ink: "text-cream/70",
};

/**
 * A full-width page section on one of the three brand surfaces.
 *
 * Sections alternate cream and teal/ink down a page — that rhythm is what
 * makes long editorial pages readable, so prefer alternating over stacking
 * two of the same tone.
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
      className={cn(SURFACE[tone], "scroll-mt-16", className)}
      {...rest}
    >
      <div className="container-page py-20 sm:py-28">{children}</div>
    </section>
  );
}

/**
 * The section opener: an eyebrow, then a headline whose second line turns
 * italic terracotta. That turn is the brand's signature typographic move —
 * one per section, never more.
 *
 * `title` is the plain first line; `accent` is the italic second line. Both
 * render inside a single `<h2>` so the heading reads as one string to
 * assistive tech and to search engines.
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
      <Heading
        id={id}
        className={cn(
          "font-display mt-6 font-extrabold tracking-tight text-balance",
          level === 1
            ? "text-[clamp(2.25rem,7vw,4rem)] leading-[1.02]"
            : "text-[clamp(1.875rem,4.5vw,3rem)] leading-[1.05]",
        )}
      >
        {title}
        {accent && (
          <>
            {" "}
            <em className={cn("italic", ACCENT[tone])}>{accent}</em>
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
