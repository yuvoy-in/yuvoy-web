import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Button } from "./button";

describe("Button", () => {
  it("renders its label", () => {
    render(<Button>Book</Button>);
    expect(screen.getByRole("button", { name: "Book" })).toBeInTheDocument();
  });

  it("applies the accent variant", () => {
    render(<Button variant="accent">Go</Button>);
    expect(screen.getByRole("button", { name: "Go" }).className).toContain(
      "bg-terra",
    );
  });

  it("is disabled when disabled", () => {
    render(<Button disabled>Wait</Button>);
    expect(screen.getByRole("button", { name: "Wait" })).toBeDisabled();
  });
});
