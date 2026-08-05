import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Button } from "./button";

describe("Button", () => {
  it("renders its label", () => {
    render(<Button>Book</Button>);
    expect(screen.getByRole("button", { name: "Book" })).toBeInTheDocument();
  });

  it("defaults to the primary variant, filled with forest", () => {
    // Monochrome CTAs (owner direction 2026-08-05): forest fill on cream
    // surfaces, 11.44:1. If this ever flips to a terra fill, the CTA is
    // back on the retired template accent — and `bg-terra` would fail AA.
    render(<Button>Go</Button>);
    expect(screen.getByRole("button", { name: "Go" }).className).toContain(
      "bg-forest",
    );
  });

  it("offers paper as the primary on forest surfaces", () => {
    render(<Button variant="paper">Go</Button>);
    const cls = screen.getByRole("button", { name: "Go" }).className;
    expect(cls).toContain("bg-cream");
    // The ring offset must follow the dark surface behind the button.
    expect(cls).toContain("focus-visible:ring-offset-forest");
  });

  it("applies the outline variant as the secondary action", () => {
    render(<Button variant="outline">Later</Button>);
    expect(screen.getByRole("button", { name: "Later" }).className).toContain(
      "border-forest/25",
    );
  });

  it("is disabled when disabled", () => {
    render(<Button disabled>Wait</Button>);
    expect(screen.getByRole("button", { name: "Wait" })).toBeDisabled();
  });
});
