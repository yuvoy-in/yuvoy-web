/**
 * Renders structured data as a JSON-LD script tag.
 *
 * Server-only and inert: it emits data, never behaviour. Content comes from
 * the builders in `src/lib/site/structured-data.ts`, which is where the
 * allow-list of permitted `@type`s lives — do not hand a literal object to
 * this component, or it bypasses the one place that gets audited.
 */
export function JsonLd({ schemas }: { schemas: Record<string, unknown>[] }) {
  if (schemas.length === 0) return null;
  return (
    <script
      type="application/ld+json"
      // The payload is built from static, code-controlled values — no visitor
      // input reaches it. JSON.stringify escaping is sufficient here, but the
      // closing-tag guard prevents any future string value breaking out.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(
          schemas.length === 1 ? schemas[0] : schemas,
        ).replace(/</g, "\\u003c"),
      }}
    />
  );
}
