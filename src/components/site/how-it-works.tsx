import { Section, SectionHeading } from "@/components/ui/section";
import { ProductDemo, type ActCopy } from "@/components/landing/product-demo";

/**
 * How Yuvoy works, in three steps and one visual.
 *
 * The three steps are the tour's own rail — watch, understand, book — rather
 * than a second list beside it. That is the whole point of the decision: a
 * section that names three steps and then shows a phone naming the same three
 * steps has said everything twice, which is exactly the repetition this
 * restructure exists to remove. The rail carries the words, the phone carries
 * the proof, and they are the same object.
 *
 * The sentences are longer here than on the homepage. This section is the
 * explanation, so "check the duration, price, inclusions, requirements and who
 * runs it" is the point of it; on the homepage the headline has already made
 * the argument and the rail is a caption.
 *
 * There is exactly one pre-launch line, at the foot. Booking is the third
 * step, so this is the one place on the page where the reader's next thought
 * is "can I do that now?" and the answer belongs.
 */
const EXPLORE_ACT_COPY: ActCopy = {
  watch: "See short videos of the real experience.",
  understand:
    "Check the duration, price, inclusions, requirements and who runs it.",
  book: "Choose your date and reserve it without leaving the flow.",
};

export function HowItWorks() {
  return (
    <Section id="how-it-works" aria-labelledby="how-it-works-heading">
      <SectionHeading
        id="how-it-works-heading"
        eyebrow="How it works"
        title="From watching to going,"
        accent="in three simple steps."
      />

      <div className="mt-14 sm:mt-16">
        <ProductDemo actCopy={EXPLORE_ACT_COPY} />
      </div>
    </Section>
  );
}
