import { cn } from "@/lib/cn";
import { CONTACT_CHANNEL_LIST } from "@/lib/site/contact";

/**
 * The two ways to reach Yuvoy, as a ruled list.
 *
 * Shared by `/contact` and the homepage's glance so the address and the number
 * exist in exactly one place. Both are real links: an email that opens a
 * composer and a `wa.me` link that opens the thread. Neither is plain text —
 * a phone number nobody can tap is a phone number nobody uses on the device
 * most people are reading this on.
 *
 * `rel="noopener noreferrer"` on the WhatsApp link because it leaves the site;
 * `target` is deliberately absent, so the visitor's own browser decides
 * whether that is a new tab, and we do not take the decision from them.
 */
export function ContactChannels({
  tone = "cream",
  className,
}: {
  tone?: "cream" | "ink";
  className?: string;
}) {
  const dark = tone === "ink";

  return (
    <ul
      className={cn(
        "grid grid-cols-1 gap-x-10 gap-y-8 border-t pt-8 sm:grid-cols-2",
        dark ? "border-cream/12" : "border-cream-line",
        className,
      )}
    >
      {CONTACT_CHANNEL_LIST.map((channel) => (
        <li key={channel.key}>
          <p
            className={cn(
              "label",
              dark ? "text-terra-soft" : "text-terra-deep",
            )}
          >
            {channel.label}
          </p>
          <p className="mt-3">
            <a
              href={channel.href}
              {...(channel.href.startsWith("http")
                ? { rel: "noopener noreferrer" }
                : {})}
              className={cn(
                "font-display tracking-display rounded-edge text-xl leading-snug font-normal underline-offset-4 transition-colors duration-200 hover:underline sm:text-2xl",
                dark
                  ? "text-cream hover:text-terra-soft focus-visible:ring-terra-soft"
                  : "text-forest hover:text-terra-deep focus-visible:ring-terra-deep",
                "focus-visible:ring-2 focus-visible:outline-none",
              )}
            >
              {channel.value}
            </a>
          </p>
          <p
            className={cn(
              "mt-2 text-sm leading-relaxed",
              dark ? "text-cream/70" : "text-forest/75",
            )}
          >
            {channel.note}
          </p>
        </li>
      ))}
    </ul>
  );
}
