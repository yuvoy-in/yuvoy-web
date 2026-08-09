import type { ReactNode } from "react";
import { ANNOUNCEMENT } from "@/lib/site/launch";

/**
 * The title spread that opens `/explore`, `/operators` and `/about`.
 *
 * ## The composition
 *
 * A dark cover split in two: the statement on the left, and on the right an
 * index of what the page contains. It is the shape of a magazine feature's
 * opening spread rather than a hero with a button in it, and it does real
 * work — these are long editorial pages, and an index is how a reader decides
 * where to go without a sticky sub-nav following them down the screen.
 *
 * It was `/explore`'s own layout until 2026-08-07; the owner asked for the
 * other two interior pages to match, so it became a component rather than
 * three copies that would drift.
 *
 * ## Why the index and not a pair of buttons
 *
 * `/explore` used to carry "See destinations" and "How Yuvoy works" here.
 * Both pointed at sections already half visible below the fold, which makes a
 * call to action out of a scroll — the reader's own next gesture does the same
 * thing, faster. Removed on owner direction. `children` still exists for the
 * one page with a genuine action to offer at the top: `/operators`, whose
 * whole purpose is the application.
 *
 * ## The header contract
 *
 * `data-dark-hero` is how `useHeaderChrome` knows to go transparent, and
 * `-mt-16` pulls the cover up behind the header's 64px of flow so that
 * transparency shows the cover rather than the page background. The inner top
 * padding puts the content back. **A route that renders this must also appear
 * in `isCoverRoute`** or the bar renders cream on the server and flips to
 * transparent after hydration, which flashes on every load.
 */
export function PageIntro({
  eyebrow,
  title,
  accent,
  lede,
  contents,
  children,
}: {
  eyebrow: string;
  title: string;
  /** The italic terracotta turn. The brand's signature typographic move. */
  accent?: string;
  lede: ReactNode;
  /** In-page anchors, in the order the sections appear. */
  contents: { href: string; label: string }[];
  /** An optional action. Only `/operators` has one worth putting up here. */
  children?: ReactNode;
}) {
  return (
    <section
      data-dark-hero
      className="bg-forest text-cream relative -mt-16 overflow-hidden"
    >
      {/* The field: the same breathing lagoon light and filmic grain the
          homepage cover uses, without its photography. Decorative, inert. */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="hero-atmosphere" />
        <div className="grain" />
      </div>

      <div className="container-page relative pt-24 pb-14 sm:pt-36 sm:pb-24">
        <div className="grid grid-cols-1 gap-x-10 gap-y-10 sm:gap-y-14 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)]">
          <div>
            <p className="label text-terra-soft">{eyebrow}</p>
            <h1 className="font-display tracking-display mt-4 max-w-3xl text-[clamp(2.5rem,6.5vw,4.5rem)] leading-[1.02] font-normal text-balance sm:mt-6">
              {title}
              {accent && (
                <>
                  {" "}
                  <em className="text-terra-soft font-turn italic">{accent}</em>
                </>
              )}
            </h1>
            <div className="text-cream/75 mt-6 max-w-xl leading-relaxed sm:mt-8 sm:text-lg">
              {lede}
            </div>
            {children && <div className="mt-8 sm:mt-10">{children}</div>}
          </div>

          <nav aria-label="On this page" className="lg:pt-3">
            <p className="label text-cream/70">On this page</p>
            <ol className="border-cream/12 mt-4 border-t sm:mt-5">
              {contents.map((item, i) => (
                <li key={item.href} className="border-cream/12 border-b">
                  {/*
                    Native anchors, not next/link: a hash-only href pushed
                    through the router uses history.pushState, which moves the
                    URL without moving the page. A plain anchor sets
                    location.hash natively, which scrolls.
                  */}
                  <a
                    href={item.href}
                    className="group text-cream hover:text-terra-soft focus-visible:ring-terra-soft flex items-baseline gap-5 py-4 transition-colors duration-200 focus-visible:ring-2 focus-visible:outline-none"
                  >
                    <span className="label text-cream/70 flex-none">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-display tracking-display flex-1 text-xl leading-snug font-normal">
                      {item.label}
                    </span>
                    <span
                      aria-hidden
                      className="text-terra-soft ease-interaction flex-none transition-transform duration-200 group-hover:translate-y-0.5"
                    >
                      ↓
                    </span>
                  </a>
                </li>
              ))}
            </ol>
            {/* The launch position, once per page, where it is context rather
                than an announcement. */}
            <p className="label text-cream/70 mt-6">{ANNOUNCEMENT.short}</p>
          </nav>
        </div>
      </div>
    </section>
  );
}
