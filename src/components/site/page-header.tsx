import type { ReactNode } from "react";

/**
 * The opening block of an interior page: eyebrow, H1, lede.
 *
 * Every page gets exactly one of these, so every route has exactly one H1 and
 * a consistent entry rhythm. The headline takes the same shape as a section
 * heading — a plain first line and an italic terracotta turn.
 */
export function PageHeader({
  eyebrow,
  title,
  accent,
  lede,
  children,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  lede?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="border-paper-line border-b">
      <div className="container-page py-14 sm:py-28">
        <p className="eyebrow text-terra-deep">{eyebrow}</p>
        <h1 className="font-display tracking-display mt-4 max-w-4xl text-[clamp(2.5rem,6.5vw,4.25rem)] leading-[1.01] font-normal text-balance sm:mt-6">
          {title}
          {accent && (
            <>
              {" "}
              <em className="text-terra font-turn italic">{accent}</em>
            </>
          )}
        </h1>
        {lede && (
          <div className="text-forest/75 mt-6 max-w-2xl leading-relaxed sm:mt-8 sm:text-lg">
            {lede}
          </div>
        )}
        {children && <div className="mt-8 sm:mt-10">{children}</div>}
      </div>
    </header>
  );
}
