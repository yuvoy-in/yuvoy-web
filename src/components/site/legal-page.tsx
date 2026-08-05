import type { ReactNode } from "react";
import Link from "next/link";

/**
 * Shared shell for the legal pages.
 *
 * Long prose at a readable measure, with headings that carry the document's
 * structure rather than decoration. Both pages state a "last updated" date —
 * a legal document with no date is not much of a document.
 */
export function LegalPage({
  title,
  updated,
  intro,
  children,
}: {
  title: string;
  updated: string;
  intro: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 sm:px-10 sm:py-24">
      <p className="eyebrow text-terra-deep">Legal</p>
      <h1 className="font-display text-forest mt-6 text-[clamp(2rem,5vw,3rem)] leading-[1.05] font-semibold tracking-tight">
        {title}
      </h1>
      <p className="label text-forest/75 mt-6">Last updated {updated}</p>
      <div className="text-forest/75 mt-8 leading-relaxed">{intro}</div>
      <div className="mt-10 flex flex-col gap-10">{children}</div>
      <Link
        href="/"
        className="label tap-target text-forest/75 hover:text-forest mt-14"
      >
        ← Back home
      </Link>
    </main>
  );
}

/** One numbered section of a legal document. */
export function LegalSection({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="font-display text-forest text-xl font-semibold tracking-tight">
        {heading}
      </h2>
      <div className="text-forest/75 mt-4 flex flex-col gap-4 leading-relaxed">
        {children}
      </div>
    </section>
  );
}
