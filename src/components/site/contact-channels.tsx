import type { ComponentType } from "react";
import { cn } from "@/lib/cn";
import { CONTACT_CHANNEL_LIST } from "@/lib/site/contact";
import { MailIcon, WhatsappIcon } from "@/components/site/contact-icons";

/**
 * The two ways to reach Yuvoy, as a ruled pair.
 *
 * Both are real links: an email that opens a composer and a `wa.me` link that
 * opens the thread. Neither is plain text — a phone number nobody can tap is a
 * phone number nobody uses on the device most people are reading this on.
 *
 * `rel="noopener noreferrer"` on the WhatsApp link because it leaves the site;
 * `target` is deliberately absent, so the visitor's own browser decides
 * whether that is a new tab, and we do not take the decision from them.
 *
 * ## The plate, and why the whole row is the link
 *
 * Each channel carries a bordered square holding its glyph (2026-08-11). It is
 * the one place on the site with an icon, for the reason set out in
 * `contact-icons.tsx`: this page is scanned, not read.
 *
 * The plate, the label and the address are **one anchor**, not an icon beside
 * a link. Two targets that go to the same place is the pattern the destination
 * plates were rebuilt to avoid, and it costs a thumb the easiest 44px on the
 * row. The note underneath stays outside the link: it explains the choice, and
 * a visitor who has already made it should not have to skip prose to tap.
 *
 * ## The divider
 *
 * A hairline between the pair from `sm` up, drawn as the second item's left
 * border with the gutter split evenly either side of it (`pr` on the first,
 * `pl` on the second, no grid gap). A grid gap plus a border would put the
 * rule against the second column rather than between the two.
 */
const CHANNEL_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  email: MailIcon,
  whatsapp: WhatsappIcon,
};

export function ContactChannels({
  tone = "cream",
  className,
}: {
  tone?: "cream" | "ink";
  className?: string;
}) {
  const dark = tone === "ink";
  const rule = dark ? "border-cream/12" : "border-cream-line";

  return (
    <ul
      className={cn(
        "grid grid-cols-1 gap-y-10 border-t pt-8 sm:grid-cols-2 sm:gap-y-0",
        rule,
        className,
      )}
    >
      {CONTACT_CHANNEL_LIST.map((channel, index) => {
        const Icon = CHANNEL_ICONS[channel.key];
        const external = channel.href.startsWith("http");

        return (
          <li
            key={channel.key}
            className={cn(
              index === 0 ? "sm:pr-8" : "sm:border-l sm:pl-8",
              index > 0 && rule,
            )}
          >
            <a
              href={channel.href}
              {...(external ? { rel: "noopener noreferrer" } : {})}
              className={cn(
                // `items-start`, not `items-center`: the label-plus-address
                // block is 46px against the plate's 44, so the two read as
                // centred anyway — and if an address ever does take a second
                // line, the plates still agree with each other instead of one
                // sliding half a row down.
                "group rounded-edge flex items-start gap-4 focus-visible:ring-2 focus-visible:outline-none",
                dark
                  ? "focus-visible:ring-terra-soft"
                  : "focus-visible:ring-terra-deep",
              )}
            >
              {Icon && (
                <span
                  className={cn(
                    "rounded-edge ease-interaction flex size-11 flex-none items-center justify-center border transition-colors duration-200",
                    dark
                      ? "border-terra-soft/45 text-terra-soft group-hover:border-terra-soft group-hover:bg-terra-soft/10"
                      : "border-terra-deep/40 text-terra-deep group-hover:border-terra-deep group-hover:bg-terra-deep/8",
                  )}
                >
                  <Icon className="size-5" />
                </span>
              )}

              <span className="min-w-0">
                <span
                  className={cn(
                    "label block",
                    dark ? "text-terra-soft" : "text-terra-deep",
                  )}
                >
                  {channel.label}
                </span>
                {/*
                  `wrap-break-word`, not `truncate`: an address that is too
                  narrow for its column must still be readable by somebody who
                  cannot tap it — copying it off the screen is exactly what a
                  person on a desktop with no mail client does.

                  The size steps back down at `lg`, which is the one breakpoint
                  where these sit two-up inside a half-width column: `text-2xl`
                  there leaves the number ~190px of a 250px cell and it breaks
                  across two lines. Below `lg` the pair has the full measure and
                  can afford the larger cut.
                */}
                <span
                  className={cn(
                    "font-display tracking-display mt-1 block text-xl leading-snug font-normal wrap-break-word underline-offset-4 transition-colors duration-200 group-hover:underline sm:text-2xl lg:text-xl",
                    dark
                      ? "text-cream group-hover:text-terra-soft"
                      : "text-forest group-hover:text-terra-deep",
                  )}
                >
                  {channel.value}
                </span>
              </span>
            </a>

            <p
              className={cn(
                // `ml-15` is the plate (44px) plus its gap (16px), so the note
                // hangs off the address rather than the icon.
                "mt-3 max-w-sm text-sm leading-relaxed sm:ml-15",
                dark ? "text-cream/70" : "text-forest/75",
              )}
            >
              {channel.note}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
