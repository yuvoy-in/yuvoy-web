import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import ts from "typescript";

/**
 * No product fact may be written into this site's source (yuvoy-web#171).
 *
 * The homepage carried a made-up operator, "₹4,500", "3 seats left today"
 * and a booking reference for six weeks, beside real operators and real
 * prices. It was allowed because it sat inside a wrapper the e2e guard was
 * told to skip, and a skipped region is where a rule stops being checked. The
 * listing on the homepage is now read from the API, so a price, a seat count,
 * a booking reference or a rating typed into a component is never right.
 *
 * This reads every string and every piece of JSX text under `src/`, the way
 * the compiler sees them, so a comment explaining a past mistake is free to
 * quote it and the code is not. Tests are exempt: their fixtures are data.
 */
// The repository root, as `palette.test.ts` finds it: under jsdom,
// `import.meta.url` is not a file URL.
const SRC = join(process.cwd(), "src");

const INVENTED = [
  { what: "a price", pattern: /₹\s?\d/ },
  { what: "a seat count", pattern: /\b\d+\s+seats?\s+(left|available)\b/i },
  { what: "a booking reference", pattern: /\bYV-\d+/ },
  { what: "a rating", pattern: /★|\b[1-5]\.\d\s*\(\d+\)/ },
];

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    const isSource =
      /\.tsx?$/.test(entry.name) && !entry.name.endsWith(".d.ts");
    return isSource && !/\.test\.tsx?$/.test(entry.name) ? [path] : [];
  });
}

/** Every string literal, template chunk and JSX text in a file. */
function writtenText(path: string): { text: string; line: number }[] {
  const source = ts.createSourceFile(
    path,
    readFileSync(path, "utf8"),
    ts.ScriptTarget.Latest,
    true,
    path.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const found: { text: string; line: number }[] = [];
  const visit = (node: ts.Node) => {
    if (
      ts.isStringLiteralLike(node) ||
      ts.isTemplateLiteralToken(node) ||
      ts.isJsxText(node)
    ) {
      const { line } = source.getLineAndCharacterOfPosition(node.getStart());
      found.push({ text: node.text, line: line + 1 });
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return found;
}

describe("source text", () => {
  it("states no price, seat count, booking reference or rating of its own", () => {
    const offences = sourceFiles(SRC).flatMap((path) =>
      writtenText(path).flatMap(({ text, line }) =>
        INVENTED.filter(({ pattern }) => pattern.test(text)).map(
          ({ what }) =>
            `${relative(SRC, path)}:${line} writes ${what}: ${JSON.stringify(text.trim())}`,
        ),
      ),
    );
    expect(offences).toEqual([]);
  });
});
