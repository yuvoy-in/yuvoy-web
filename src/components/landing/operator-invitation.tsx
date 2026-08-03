import Link from "next/link";
import { Section, SectionHeading } from "@/components/ui/section";
import { buttonVariants, ButtonArrow } from "@/components/ui/button";
import { cn } from "@/lib/cn";

/**
 * The operator invitation.
 *
 * Operators are the harder side of the marketplace to acquire and the reason
 * the product can exist at all, so they get a full section rather than a
 * footnote.
 *
 * **What founding-operator status is not:** it is not self-serve tooling, a
 * payout schedule, or agreed commercial terms. None of those exist, so none
 * are promised. What is on offer is early involvement and a conversation —
 * both of which are real.
 */
const OFFER = [
  {
    title: "Early access when we open",
    body: "Operators who join before launch are set up with the first wave of listings, rather than joining a queue afterwards.",
  },
  {
    title: "A say in how it works",
    body: "The tools are being designed now. What you tell us about running your days on the water shapes what gets built.",
  },
  {
    title: "A conversation, not a contract",
    body: "Applying opens a discussion about what you offer. Terms, pricing and listings come later, agreed with you.",
  },
];

export function OperatorInvitation() {
  return (
    <Section tone="ink" aria-labelledby="operators-heading">
      <SectionHeading
        id="operators-heading"
        tone="ink"
        eyebrow="For operators"
        title="You already run something people love."
        accent="Show it properly."
        body="If you run dives, boats, kitchens or walks across Havelock, Neil or Port Blair, we would like to talk before we open."
      />

      <ul className="border-cream/12 mt-16 grid grid-cols-1 gap-px border-t md:grid-cols-3">
        {OFFER.map((item) => (
          <li key={item.title} className="pt-10 md:pr-8">
            <h3 className="font-display text-xl font-bold tracking-tight">
              {item.title}
            </h3>
            <p className="text-cream/70 mt-3 leading-relaxed">{item.body}</p>
          </li>
        ))}
      </ul>

      <Link
        href="/waitlist?audience=provider"
        className={cn(
          buttonVariants({ size: "lg" }),
          "focus-visible:ring-offset-forest mt-14 flex w-full sm:inline-flex sm:w-auto",
        )}
      >
        Apply as a founding operator
        <ButtonArrow />
      </Link>
    </Section>
  );
}
