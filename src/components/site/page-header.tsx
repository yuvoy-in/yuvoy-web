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
    <header className="border-cream-line border-b">
      <div className="container-page py-20 sm:py-28">
        <p className="eyebrow text-terra-deep">{eyebrow}</p>
        <h1 className="font-display mt-6 max-w-4xl text-[clamp(2.25rem,6vw,4rem)] leading-[1.03] font-extrabold tracking-tight text-balance">
          {title}
          {accent && (
            <>
              {" "}
              <em className="text-terra italic">{accent}</em>
            </>
          )}
        </h1>
        {lede && (
          <div className="text-teal/75 mt-8 max-w-2xl text-lg leading-relaxed">
            {lede}
          </div>
        )}
        {children && <div className="mt-10">{children}</div>}
      </div>
    </header>
  );
}
