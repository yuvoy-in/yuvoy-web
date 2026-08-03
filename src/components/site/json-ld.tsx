/**
 * Renders structured data as a JSON-LD script tag.
 *
 * Server-only and inert: it emits data, never behaviour. Content comes from
 * the builders in `src/lib/site/structured-data.ts`, which is where the
 * allow-list of permitted `@type`s lives — do not hand a literal object to
 * this component, or it bypasses the one place that gets audited.
 */
/** `@context` belongs on the wrapper once, not repeated on every node. */
function withoutContext(schema: Record<string, unknown>) {
  const node = { ...schema };
  delete node["@context"];
  return node;
}

export function JsonLd({ schemas }: { schemas: Record<string, unknown>[] }) {
  if (schemas.length === 0) return null;

  /*
    Several entities on one page go inside `@graph`, never a bare top-level
    array.

    Both are valid JSON-LD, but an array carries no `@context` of its own, and
    consumers routinely read `data["@context"]` before checking what they were
    handed. On an array that is `undefined`, and the next call on it throws —
    which is exactly how this surfaced, as a structured-data parser falling
    over on the homepage. `@graph` is also the shape Google documents for
    multiple entities, so it is the better-supported form regardless.
  */
  const payload =
    schemas.length === 1
      ? schemas[0]
      : {
          "@context": "https://schema.org",
          "@graph": schemas.map(withoutContext),
        };

  return (
    <script
      type="application/ld+json"
      // The payload is built from static, code-controlled values — no visitor
      // input reaches it. JSON.stringify escaping is sufficient here, but the
      // closing-tag guard prevents any future string value breaking out.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(payload).replace(/</g, "\\u003c"),
      }}
    />
  );
}
