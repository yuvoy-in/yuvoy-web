import { cn } from "@/lib/cn";
import {
  HeartIcon,
  LockIcon,
  PersonIcon,
  ReadIcon,
} from "@/components/site/contact-icons";

/**
 * The four things that are true about writing to Yuvoy, as a ruled strip.
 *
 * ## What is not here, and why
 *
 * The reference this was drawn from carries "We usually reply within 24
 * hours" in this row. **The site publishes no response time, anywhere** —
 * owner direction, stated in `@/lib/site/contact`, asserted by
 * `e2e/contact.spec.ts`, and the same rule that keeps launch months off the
 * rest of the site. A pre-launch team will miss that window eventually, and a
 * missed promise costs more than one never made.
 *
 * So the slot carries what the site already commits to instead: a person
 * reads every message. That is a statement about who, not about when, and it
 * is the one the homepage's glance and this page's own copy have both made
 * since 2026-08-07.
 *
 * ## Every line here has to stay true
 *
 * This is a trust row on a page whose whole subject is trust, which makes it
 * the easiest place on the site to write something nobody can honour. Each
 * entry is a standing fact about how the channels are run, not a service
 * level: the addresses are monitored by people, the messages are read, the
 * email address is used to answer and for nothing else (the endpoint has no
 * marketing-consent column to make it otherwise), and the fourth is a
 * statement of intent that promises no action.
 *
 * Remove an entry the day it stops being true, exactly as `CONTACT_CHANNELS`
 * says to remove a channel the day it stops being read.
 */
const ASSURANCES = [
  { key: "people", Icon: PersonIcon, lead: "Real people.", rest: "No bots." },
  {
    key: "read",
    Icon: ReadIcon,
    lead: "A person reads",
    rest: "every message.",
  },
  {
    key: "privacy",
    Icon: LockIcon,
    lead: "Your privacy",
    rest: "is respected.",
  },
  {
    key: "care",
    Icon: HeartIcon,
    lead: "We care about",
    rest: "your experience.",
  },
];

export function ContactAssurances({ className }: { className?: string }) {
  return (
    /*
      A list, not a row of headings: four peer statements with no order to
      them. It carries no accessible name because the strip says nothing the
      four entries do not — a "Why write to us" label would be a heading
      invented for the outline rather than for the page.

      One column on a phone, two from `sm`, four from `lg`. The dividers only
      appear at four across: between two columns a vertical rule reads as a
      table, and stacked it reads as nothing at all.
    */
    <ul
      className={cn(
        "border-paper/12 rounded-edge grid grid-cols-1 gap-x-8 gap-y-7 border px-6 py-7 sm:grid-cols-2 sm:px-8 lg:grid-cols-4 lg:gap-x-0",
        className,
      )}
    >
      {ASSURANCES.map(({ key, Icon, lead, rest }, index) => (
        <li
          key={key}
          className={cn(
            "flex items-center gap-4",
            index > 0 && "lg:border-paper/12 lg:border-l lg:pl-7",
            index < ASSURANCES.length - 1 && "lg:pr-7",
          )}
        >
          <Icon className="text-terra-soft size-6" />
          {/*
            Two lines by construction rather than by wrapping. The break is
            the composition — four entries breaking at four different points
            would read as a paragraph cut into pieces — and it holds at every
            width because it is a block, not a `<br>` waiting on a measure.
          */}
          <p className="text-paper/70 text-sm leading-snug">
            <span className="block">{lead}</span>
            <span className="block">{rest}</span>
          </p>
        </li>
      ))}
    </ul>
  );
}
