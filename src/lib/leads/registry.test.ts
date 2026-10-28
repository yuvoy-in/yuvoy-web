import { describe, it, expect } from "vitest";
import { operatorHref } from "./registry";

/**
 * `operatorHref` is the one place every internal link to the business page is
 * built: the homepage teaser, the header, the menu and the legacy `#providers`
 * hand-off all call it.
 *
 * The page moved from `/operators` to `/hosts` (D-049, yuvoy-mobile#397). The
 * old path still works through a permanent redirect, so a link left on it
 * would not look broken, it would just take one more hop on every tap. These
 * pin that the links go to `/hosts` directly, and that the campaign source and
 * the `#apply` fragment arrive exactly as they did before the move
 * (yuvoy-web#70: a source dropped here is lost for good).
 */
describe("operatorHref", () => {
  it("gives organic traffic a clean /hosts", () => {
    expect(operatorHref("web")).toBe("/hosts");
    expect(operatorHref("web", "#apply")).toBe("/hosts#apply");
  });

  it("carries a campaign source and the fragment", () => {
    expect(operatorHref("ferry", "#apply")).toBe("/hosts?source=ferry#apply");
    expect(operatorHref("hotel")).toBe("/hosts?source=hotel");
  });
});
