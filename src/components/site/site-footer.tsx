import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";
import { FooterCta } from "@/components/site/footer-cta";
import { PrivacyChoices } from "@/components/analytics/consent-banner";
import { cn } from "@/lib/cn";
import {
  CONTACT_CHANNELS,
  FOOTER_COLUMNS,
  LAUNCH_STATUS,
} from "@/lib/site/nav";

/**
 * The site footer: the page's closing statement, then its map.
 *
 * Identity on the left, every link group evenly on the right, and a single
 * legal rule closing it. The map used to sit in a four-column grid that only
 * ever held three groups, so the columns bunched into the left of the page
 * with a column of dead space beside them, and the identity block sat in a
 * second row below with no relationship to them. One grid fixes both.
 *
 * Every link comes from the route registry, so a column can only ever list
 * pages that exist. Empty columns are dropped rather than rendered as a
 * heading over nothing, and the contact row is omitted entirely while no
 * monitored channel is confirmed (publishing an unread address is worse than
 * publishing none).
 */

/**
 * How the link groups divide the map, by however many groups the registry
 * actually produces. Written out rather than composed at runtime because
 * Tailwind only ships class names it can see in the source.
 */
const GROUP_GRID: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-4",
};

export function SiteFooter() {
  const groups = [
    ...FOOTER_COLUMNS,
    ...(CONTACT_CHANNELS.length > 0
      ? [{ key: "contact", title: "Contact", items: CONTACT_CHANNELS }]
      : []),
  ];

  // The top hairline matters: every dark surface is the same forest now, so on
  // a route that ends in one (the registration form, a closing section) the
  // footer would otherwise run straight on from it with no seam at all.
  return (
    <footer className="bg-forest text-cream border-cream/12 border-t">
      <FooterCta />

      <div className="container-page py-16 sm:py-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1.95fr)] lg:gap-20">
          {/* Identity. */}
          <div>
            <Wordmark tone="onDark" className="h-10" />
            <p className="text-cream/70 mt-6 max-w-xs text-sm leading-relaxed">
              The experience commerce platform. First stop: the Andaman Islands.
            </p>
            <p className="text-cream/70 mt-5 flex max-w-xs items-start gap-2.5 text-sm leading-relaxed">
              <span aria-hidden className="bg-terra mt-2 size-1 shrink-0" />
              {LAUNCH_STATUS}
            </p>
          </div>

          {/* Map. */}
          {groups.length > 0 && (
            <nav
              aria-label="Footer"
              className={cn(
                "grid gap-x-4 gap-y-10 sm:gap-x-8",
                GROUP_GRID[groups.length] ?? "grid-cols-2 sm:grid-cols-4",
              )}
            >
              {groups.map((group) => (
                <div key={group.key}>
                  {/* h2, not h3: these are top-level footer sections, siblings
                      of the page's own sections. As h3 they skipped a level on
                      pages whose main content has no h2 (e.g. /waitlist). */}
                  <h2 className="label text-terra-soft">{group.title}</h2>
                  <ul className="mt-5 flex flex-col gap-2.5">
                    {group.items.map((item) => (
                      <li key={item.href}>
                        {item.href.startsWith("/") ? (
                          <Link
                            href={item.href}
                            className="tap-target text-cream/70 hover:text-cream text-sm leading-snug transition-colors duration-200"
                          >
                            {item.label}
                          </Link>
                        ) : (
                          <a
                            href={item.href}
                            className="tap-target text-cream/70 hover:text-cream text-sm leading-snug transition-colors duration-200"
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

        {/* Legal. */}
        <div className="border-cream/12 mt-14 flex flex-col-reverse items-start gap-4 border-t pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="label text-cream/60">
            © {new Date().getFullYear()} Yuvoy · Andaman Islands, India
          </p>
          {/* Consent must be as easy to withdraw as it was to give. */}
          <PrivacyChoices />
        </div>
      </div>
    </footer>
  );
}
