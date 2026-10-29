import { render, screen } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";
import { TrapField } from "./trap-field";

function Harness() {
  const { register } = useForm<{ extra: string }>({
    defaultValues: { extra: "" },
  });
  return (
    <form>
      <TrapField registration={register("extra")} />
    </form>
  );
}

/**
 * The trap a person never meets (issue case 11, point 7 A). jsdom has no
 * layout, so "off screen" is asserted on the class that moves it, and the
 * browser half (never in view, never reached by Tab) is in e2e/submit.spec.ts.
 */
describe("TrapField", () => {
  it("is labelled for a screen reader, which is told to leave it", () => {
    render(<Harness />);
    expect(screen.getByLabelText("Leave this empty")).toBeInTheDocument();
  });

  it("is out of the keyboard order and never autofilled", () => {
    render(<Harness />);
    const input = screen.getByLabelText("Leave this empty");
    expect(input).toHaveAttribute("tabindex", "-1");
    expect(input).toHaveAttribute("autocomplete", "off");
    expect(input).toHaveAttribute("name", "extra");
  });

  it("is moved off screen, not hidden", () => {
    render(<Harness />);
    const input = screen.getByLabelText("Leave this empty");
    const box = input.closest("[data-trap]") as HTMLElement;
    expect(box.className).toMatch(/-left-\[9999px\]/);
    expect(box.className).toMatch(/\babsolute\b/);
    // Hidden would tell a bot to skip it, and aria-hidden would leave a
    // screen reader user with an unlabelled box.
    expect(box.style.display).not.toBe("none");
    expect(box).not.toHaveAttribute("hidden");
    expect(box).not.toHaveAttribute("aria-hidden");
    expect(input).not.toHaveAttribute("aria-hidden");
  });
});
