import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Button } from "./button";

describe("Button", () => {
  it("renders its label", () => {
    render(<Button>Book</Button>);
    expect(screen.getByRole("button", { name: "Book" })).toBeInTheDocument();
  });

  it("defaults to the primary variant, filled with terra-deep", () => {
    // terra-deep, not terra: cream on terra would be 3.4:1 and fail AA at
    // label size. If this ever flips to `bg-terra`, contrast regresses.
    render(<Button>Go</Button>);
    expect(screen.getByRole("button", { name: "Go" }).className).toContain(
      "bg-terra-deep",
    );
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
