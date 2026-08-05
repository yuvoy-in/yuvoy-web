import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BrandIntro, IntroVeil, INTRO_DECIDE } from "./brand-intro";

/*
 * jsdom never executes injected <script> tags, so the play path here always
 * looks like a repeat visit: no `data-play` stamp, and the component must
 * take itself out of the tree. That is asserted below as real behaviour; the
 * stamped path (visible run, keypress skip, reduced motion) depends on the
 * pre-paint script and real animations, so it is asserted in the Playwright
 * suite (`e2e/brand-intro.spec.ts`), per the project's jsdom-vs-browser
 * split.
 */

describe("BrandIntro", () => {
  it("removes itself after mount when the pre-paint script has not stamped data-play", () => {
    const { container } = render(<BrandIntro />);
    expect(container.querySelector("#yuvoy-intro")).toBeNull();
  });

  it("decides before paint: the inline script carries the session flag, the reduced-motion guard and the stamp", () => {
    // The contract of the script, since jsdom cannot run it: each clause is
    // one of the three no-show paths plus the stamp that argues the veil in.
    expect(INTRO_DECIDE).toContain("yuvoy.intro-played");
    expect(INTRO_DECIDE).toContain("prefers-reduced-motion: reduce");
    expect(INTRO_DECIDE).toContain("sessionStorage.getItem");
    expect(INTRO_DECIDE).toContain("sessionStorage.setItem");
    expect(INTRO_DECIDE).toContain('setAttribute("data-play"');
    // The stamp that suspends the cover's emerge entrance until the veil
    // begins its exit (the handoff rule in globals.css).
    expect(INTRO_DECIDE).toContain('setAttribute("data-intro-wait"');
    // Defensive by contract: storage being unavailable must mean "no veil",
    // never an uncaught error before first paint.
    expect(INTRO_DECIDE).toContain("try{");
    expect(INTRO_DECIDE).toContain("catch");
  });
});

describe("IntroVeil", () => {
  it("is decorative theatre: hidden from assistive tech, with no focusable content", () => {
    const { container } = render(<IntroVeil />);
    const veil = container.querySelector("#yuvoy-intro");
    expect(veil).toHaveAttribute("aria-hidden", "true");
    expect(
      container.querySelectorAll("a, button, input, [tabindex]"),
    ).toHaveLength(0);
  });

  it("carries the brand lockup: mark on dark, YUVOY letter by letter, the kicker and the meter", () => {
    const { container } = render(<IntroVeil />);

    const mark = container.querySelector("img");
    expect(mark).not.toBeNull();
    // The generated cream vector variant: cream strokes for the dark
    // surface, tagline stripped (scripts/generate-vector-brand.mjs).
    expect(mark?.getAttribute("src")).toContain("yuvoy-mark-vector-cream");

    // Five drawn letterforms, each its own token-coloured emerging cell.
    const letters = container.querySelectorAll("svg.intro-letter");
    expect(letters).toHaveLength(5);

    expect(screen.getByText("Experience more.")).toHaveClass("intro-kicker");

    // The sign-off swash: a filled calligraphic sliver, wiped in by CSS.
    expect(container.querySelector("path.intro-stroke")).not.toBeNull();

    // The island horizon band from the owner's comp.
    expect(container.querySelector(".intro-horizon")).not.toBeNull();

    // The place line is the cover's own opening words, kept in sync by hand.
    expect(screen.getByText("Andaman Islands")).toHaveClass("intro-place");

    // One swell wing per edge, four orbit planes each: the pair leaves the
    // centre still, the planes keep neighbouring dots from moving together.
    expect(container.querySelectorAll(".intro-wave")).toHaveLength(2);
    expect(container.querySelectorAll(".intro-swell")).toHaveLength(8);
  });
});
