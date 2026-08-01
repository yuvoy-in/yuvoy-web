/**
 * The trust strip.
 *
 * Three facts that are true today — nothing counted, rated, or claimed. There
 * are no members, no press mentions and no partners to point at yet, and
 * inventing any of them is exactly the failure this rebuild exists to undo.
 */
const FACTS = [
  "Waitlist open",
  "No payment required",
  "Founding operators welcome",
];

export function TrustStrip() {
  return (
    <section aria-label="Where Yuvoy is today" className="bg-cream-deep">
      <div className="container-page">
        <ul className="divide-cream-line border-cream-line grid grid-cols-1 divide-y border-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {FACTS.map((fact) => (
            <li
              key={fact}
              className="label text-teal/75 flex items-center justify-center gap-3 py-5 text-center"
            >
              <span aria-hidden className="bg-terra size-1 shrink-0" />
              {fact}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
