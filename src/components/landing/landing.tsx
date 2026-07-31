import { Hero } from "@/components/landing/hero";
import { Building } from "@/components/landing/building";
import { LeadForms, type LeadContext } from "@/components/landing/lead-forms";
import { Faq } from "@/components/landing/faq";
import { Footer } from "@/components/landing/footer";

/**
 * The whole landing, composed. `/` renders it with organic defaults;
 * /go/<source> campaign routes render it with their attribution context.
 */
export function Landing({ context }: { context: LeadContext }) {
  return (
    <>
      <main>
        <Hero />
        <Building />
        <LeadForms context={context} />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
