import Image from "next/image";
import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";
import { FooterCta } from "@/components/site/footer-cta";
import { PrivacyChoices } from "@/components/analytics/consent-banner";
import { cn } from "@/lib/cn";
import {
  CONTACT_CHANNELS,
  FOOTER_COLUMNS,
  FOOTER_DESCRIPTION,
} from "@/lib/site/nav";
import { FOOTER_STATUS } from "@/lib/site/launch";

/**
 * The site footer: the page's closing statement, then its map.
 *
 * ## What changed on 2026-08-06
 *
 * It used to publish most of the sitemap twice over: eleven routes across
 * three columns, several of which the header also carried, under a description
 * ("the experience commerce platform") written for an investor deck rather
 * than for a traveller. The map is now nine links, none repeated, and the
 * description says what the product does in the language its visitors use.
 *
 * ## Why there is no giant "EXPERIENCE MORE." signature
 *
 * Because the lockup already is one. The owner-delivered horizontal mark
 * carries the ensō, the wordmark, the handwritten "Experience more." and its
 * underline as a single drawing (design system §2), so setting the same words
 * again at display scale below it would be the brand signing its name twice on
 * one page. The mark is given the room instead.
 *
 * Every link comes from the route registry, so a column can only ever list
 * pages that exist. Empty columns are dropped rather than rendered as a
 * heading over nothing, and the contact row is omitted entirely while no
 * monitored channel is confirmed — publishing an unread address is worse than
 * publishing none.
 */

/**
 * How the link groups divide the map, by however many groups the registry
 * actually produces. Written out rather than composed at runtime because
 * Tailwind only ships class names it can see in the source.
 */
const GROUP_GRID: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-2 sm:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-4",
};

export function SiteFooter() {
  const groups = [
    ...FOOTER_COLUMNS,
    ...(CONTACT_CHANNELS.length > 0
      ? [{ key: "contact", title: "Contact", items: CONTACT_CHANNELS }]
      : []),
  ];

  // The top hairline matters: every dark surface is the same forest, so on a
  // route that ends in one (the registration form, a closing section) the
  // footer would otherwise run straight on from it with no seam at all.
  return (
    <footer className="bg-forest text-cream border-cream/12 relative isolate border-t">
      {/*
        The owner-supplied underwater scene, merged into the field rather than
        pasted onto it — the same construction as the homepage cover.

        `object-bottom` is the whole reason this works: the frame's interest is
        along its foot (seabed, coral, a turtle) beneath an almost empty upper
        half, so anchoring it to the bottom means the crop always takes from
        the top, where there is nothing to lose. The footer's height varies
        with the page, the breakpoint and whether the closing call to action
        renders, and this holds at every one of them.

        `isolate` on the footer, and `-z-10` here, keep the artwork behind the
        content without giving any child its own stacking context to escape
        into. Every layer is inert and hidden from assistive tech.

        Contrast is not this stack's job — the artwork measures 12.3:1 to
        15.4:1 against `cream` across the frame, better than the flat forest
        it replaces. See `footer-scrim` in globals.css for the measurements.
      */}
      <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
        <Image
          src="/photography/footer.webp"
          alt=""
          fill
          quality={75}
          sizes="100vw"
          /*
            Eager, but not `priority`.

            On a short route — /terms, /privacy, a journal post — the footer is
            above the fold on arrival, and this 27KB backdrop becomes the
            Largest Contentful Paint. Lazy-loading it there means the largest
            thing on screen arrives last, which is precisely what LCP measures
            (flagged by Next's own dev warning).

            `priority` would fix that and overcorrect: it emits a preload hint
            on *every* page, including the homepage, where this sits several
            screens below a cover image that legitimately owns the preload.
            `eager` starts the fetch when the markup is parsed without
            competing for that hint — the right trade for a file this small.
          */
          loading="eager"
          className="object-cover object-bottom"
        />
        <div className="plate-wash absolute inset-0" />
        <div className="footer-scrim absolute inset-0" />
        <div className="grain" />
      </div>

      <FooterCta />

      <div className="container-page py-12 sm:py-20">
        <div className="grid grid-cols-1 gap-10 sm:gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:gap-20">
          {/* Identity. The lockup is the signature; the two lines under it
              say what Yuvoy does and where it is, and nothing else. */}
          <div>
            <Wordmark tone="onDark" className="h-16 sm:h-20" />
            <p className="text-cream/70 mt-6 max-w-xs leading-relaxed sm:mt-7">
              {FOOTER_DESCRIPTION}
            </p>
            <p className="label text-cream/70 mt-6 flex items-start gap-2.5">
              <span aria-hidden className="bg-terra mt-1.5 size-1 shrink-0" />
              {FOOTER_STATUS}
            </p>
          </div>

          {/* Map. */}
          {groups.length > 0 && (
            <nav
              aria-label="Footer"
              className={cn(
                "grid gap-x-6 gap-y-8 sm:gap-x-8 sm:gap-y-10 lg:justify-items-end",
                GROUP_GRID[groups.length] ?? "grid-cols-2 sm:grid-cols-4",
              )}
            >
              {groups.map((group) => (
                <div key={group.key} className="lg:min-w-36">
                  {/* h2, not h3: these are top-level footer sections, siblings
                      of the page's own sections. As h3 they skipped a level on
                      pages whose main content has no h2 (e.g. /waitlist). */}
                  <h2 className="label text-terra-soft">{group.title}</h2>
                  <ul className="mt-4 flex flex-col gap-2.5 sm:mt-5">
                    {group.items.map((item) => (
                      <li key={item.href}>
                        {item.href.startsWith("/") ? (
                          <Link
                            href={item.href}
                            className="tap-target text-cream/70 hover:text-cream focus-visible:ring-terra-soft rounded-edge text-sm leading-snug transition-colors duration-200 focus-visible:ring-2 focus-visible:outline-none"
                          >
                            {item.label}
                          </Link>
                        ) : (
                          <a
                            href={item.href}
                            className="tap-target text-cream/70 hover:text-cream focus-visible:ring-terra-soft rounded-edge text-sm leading-snug transition-colors duration-200 focus-visible:ring-2 focus-visible:outline-none"
                          >
                            {item.label}
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          )}
        </div>

        {/* Legal. No social row: a link to an unmaintained account is a
            promise nobody is keeping, so `CONTACT_CHANNELS` stays empty
            until a real one is confirmed. */}
        <div className="border-cream/12 mt-12 flex flex-col-reverse items-start gap-4 border-t pt-6 sm:mt-16 sm:flex-row sm:items-center sm:justify-between sm:pt-8">
          <p className="label text-cream/60">
            © {new Date().getFullYear()} Yuvoy · India
          </p>
          {/* Consent must be as easy to withdraw as it was to give. */}
          <PrivacyChoices />
        </div>
      </div>
    </footer>
  );
}
