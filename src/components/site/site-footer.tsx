import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";
import { buttonVariants, ButtonArrow } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import {
  CONTACT_CHANNELS,
  FOOTER_COLUMNS,
  LAUNCH_STATUS,
  PRIMARY_CTA,
} from "@/lib/site/nav";

/**
 * The site footer — the page's closing statement, then its map.
 *
 * Every link comes from the route registry, so a column can only ever list
 * pages that exist. Empty columns are dropped rather than rendered as a
 * heading over nothing, and the contact row is omitted entirely while no
 * monitored channel is confirmed (publishing an unread address is worse than
 * publishing none).
 */
export function SiteFooter() {
  return (
    <footer className="bg-teal text-cream">
      {/* Closing call to action. */}
      <div className="container-page border-cream/12 border-b py-20 sm:py-24">
        <p className="eyebrow text-terra-soft">Experience more.</p>
        <h2 className="font-display mt-6 max-w-3xl text-4xl leading-[1.05] font-extrabold tracking-tight text-balance sm:text-5xl">
          The islands first.{" "}
          <em className="text-terra-soft not-italic">
            Then everywhere worth going.
          </em>
        </h2>
        <p className="text-cream/70 mt-6 max-w-xl text-lg">
          Join the waitlist and we&rsquo;ll message you when the first Andaman
          experiences are ready.
        </p>
        <Link
          href={PRIMARY_CTA.href}
          className={cn(
            buttonVariants({ size: "lg" }),
            "focus-visible:ring-offset-teal mt-10 flex w-full sm:inline-flex sm:w-auto",
          )}
        >
          {PRIMARY_CTA.label}
          <ButtonArrow />
        </Link>
      </div>

      {/* Site map. */}
      {FOOTER_COLUMNS.length > 0 && (
        <div className="container-page border-cream/12 grid grid-cols-2 gap-x-8 gap-y-10 border-b py-14 sm:grid-cols-3 lg:grid-cols-4">
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.key}>
              <h3 className="label text-terra-soft">{column.title}</h3>
              <ul className="mt-5 flex flex-col gap-3">
                {column.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-cream/70 hover:text-cream text-sm transition-colors duration-200"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {CONTACT_CHANNELS.length > 0 && (
            <div>
              <h3 className="label text-terra-soft">Contact</h3>
              <ul className="mt-5 flex flex-col gap-3">
                {CONTACT_CHANNELS.map((channel) => (
                  <li key={channel.href}>
                    <a
                      href={channel.href}
                      className="text-cream/70 hover:text-cream text-sm transition-colors duration-200"
                    >
                      {channel.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Identity + status. */}
      <div className="container-page flex flex-col gap-8 py-12 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Wordmark tone="onDark" />
          <p className="text-cream/70 mt-5 max-w-sm text-sm">
            The experience commerce platform. First stop: the Andaman Islands.
          </p>
        </div>
        <div className="flex flex-col gap-3 lg:items-end lg:text-right">
          <p className="label text-cream/70">{LAUNCH_STATUS}</p>
          <p className="label text-cream/60">
            © {new Date().getFullYear()} Yuvoy · Andaman Islands, India
          </p>
        </div>
      </div>
    </footer>
  );
}
