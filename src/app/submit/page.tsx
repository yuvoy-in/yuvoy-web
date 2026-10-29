import type { Metadata } from "next";
import { SubmitFlow } from "@/components/submit/submit-flow";
import { WORDS } from "@/lib/submit/words";

export const metadata: Metadata = {
  title: WORDS.heading,
  description: WORDS.intro,
  /*
    Out of the index and the sitemap until @gamallasaiteja shares the link
    (R3-b rollout: "linked from nowhere until Teja shares it"). A sitemap
    entry is a link for crawlers, so the two flip together in one later
    change, as `/privacy` and `/terms` do (note R3-T3-web section 6 point 9 B).
    Nothing in the menu or the footer links here either.
  */
  robots: { index: false, follow: false },
};

/**
 * `/submit`: an organiser, a venue or a group sends us one event
 * (yuvoy-web#177, R3-T3; web only by design, DD-11).
 *
 * A static shell. Whether the form is open, the places, the kinds of thing
 * and the place's today are all read in the browser on mount by `SubmitFlow`,
 * never at build time: the release changes without a deploy, and every call
 * must come from the visitor's own address (see `@/lib/submit/api`).
 *
 * Paper, not a cover, so it is not in the header's cover list.
 */
export default function SubmitPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 sm:px-10 sm:py-24">
      <h1 className="font-display text-forest tracking-display text-[clamp(2rem,5vw,3rem)] leading-[1.05] font-normal">
        {WORDS.heading}
      </h1>
      <SubmitFlow />
    </main>
  );
}
