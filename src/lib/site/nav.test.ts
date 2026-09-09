import { describe, it, expect } from "vitest";
import { FOOTER_COLUMNS, FOOTER_EXTRAS } from "./nav";
import { OPERATOR_PORTAL_URL } from "./product-links";

/**
 * The footer's extras — the entries that are not routes.
 *
 * They were applied only to the `explore` column, so an extra declared under
 * any other key was dropped silently: the column still rendered, just without
 * it. That is how the operator portal link vanished on its first deploy
 * (yuvoy-web#154), and nothing caught it because a missing link looks exactly
 * like a link nobody added.
 */
describe("FOOTER_EXTRAS reach the footer", () => {
  it("renders every declared extra, in whichever column declared it", () => {
    const rendered = new Set(
      FOOTER_COLUMNS.flatMap((c) => c.items.map((i) => i.href)),
    );
    const declared = Object.entries(FOOTER_EXTRAS) as [
      string,
      { href: string; label: string }[] | undefined,
    ][];
    expect(declared.length).toBeGreaterThan(0);
    for (const [key, extras] of declared) {
      for (const extra of extras ?? []) {
        expect(
          rendered,
          `${key}: ${extra.href} is declared and not shown`,
        ).toContain(extra.href);
      }
    }
  });

  it("links the operator portal", () => {
    // Both product hosts are linked from this site (yuvoy-web#154). The
    // traveller app is linked from the calls to action; the portal is here.
    const hrefs = FOOTER_COLUMNS.flatMap((c) => c.items.map((i) => i.href));
    expect(hrefs).toContain(OPERATOR_PORTAL_URL);
  });

  it("keeps the market inside Explore rather than after it", () => {
    // `explore` orders its extra deliberately: the launch market has to read
    // as something WITHIN Explore, not as a sibling appended to the end.
    const explore = FOOTER_COLUMNS.find((c) => c.key === "explore")!;
    expect(explore.items[1].href).toBe("/#destinations");
  });
});
