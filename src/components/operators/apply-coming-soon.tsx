import Link from "next/link";

/**
 * What stands where the founding-operator application will go.
 *
 * ## Why a notice and not the form
 *
 * The form would take a complete, valid application and be answered `400` by
 * the deployed API — see `OPERATOR_FORM_LIVE`. An operator would fill in four
 * fields, press a button, and be told something went wrong through no fault
 * of their own. That is worse than not offering the form: it spends the
 * goodwill of the one person on the other side of this page who was ready to
 * act.
 *
 * So the section says plainly that applications open shortly and points at a
 * way to reach a person **today**. An operator who wants in is not blocked
 * for a moment.
 *
 * It stopped listing the address and the number outright on 2026-08-07 (owner
 * direction): on `/operators` the contact band sits directly beneath this and
 * carried both a second time. A link rather than the channels, because this
 * also renders on `/waitlist?audience=provider`, where nothing sits beneath
 * it — repeating the details would have been redundant in one place and
 * dropping them a dead end in the other.
 *
 * The "starts a conversation, not an agreement" line went with them. It is
 * not lost: the pre-launch panel in the founding-operator act carries it, and
 * an e2e assertion pins it to the page.
 *
 * ## Why it is not simply hidden
 *
 * `#apply` is linked from the operators hero, from the homepage's operator
 * act, and from the long-lived `#providers` anchor that printed materials and
 * cached 308s still point at. Removing the section would land all of them at
 * the bottom of a page with nothing there. It keeps its id, its heading and
 * its place in the page's contents index.
 *
 * Delete this component when the API change ships; the form returns in the
 * same edit.
 */
export function ApplyComingSoon() {
  return (
    <div className="max-w-xl">
      {/* No heading and no eyebrow. On `/operators` this is the right-hand
          column and `ApplyAside` owns the heading beside it; on `/waitlist`
          the heading is the page's `<h1>`. Either way, repeating it would put
          "Apply as a founding operator" on screen twice and add a heading
          level that leads nowhere. */}
      <span className="label border-terra-soft/40 text-terra-soft rounded-edge inline-block border px-3 py-1.5">
        Coming soon
      </span>

      <p className="text-cream/70 mt-6 leading-relaxed">
        The application form opens shortly. In the meantime,{" "}
        <Link
          href="/contact"
          className="text-cream focus-visible:ring-terra-soft rounded-edge underline underline-offset-2 focus-visible:ring-2 focus-visible:outline-none"
        >
          send us a message
        </Link>{" "}
        and we will start the same conversation: who you are, where you operate
        and what you run.
      </p>
    </div>
  );
}
