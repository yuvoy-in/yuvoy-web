import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { SiteMenu } from "./site-menu";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));

// jsdom's `<dialog>` and matchMedia gaps are shimmed in vitest.setup.ts.
// Escape, the focus trap and focus restoration need a real browser and are
// asserted in e2e/shell.spec.ts instead.

describe("SiteMenu", () => {
  it("starts closed and announces that to assistive tech", () => {
    render(<SiteMenu />);
    expect(screen.getByRole("button", { name: "Open menu" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("opens on the trigger and flips aria-expanded", async () => {
    const user = userEvent.setup();
    render(<SiteMenu />);
    const trigger = screen.getByRole("button", { name: "Open menu" });

    await user.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: "Close menu" })).toBeVisible();
  });

  it("closes again from the close button, once the shutter has run", async () => {
    const user = userEvent.setup();
    render(<SiteMenu />);
    const trigger = screen.getByRole("button", { name: "Open menu" });

    await user.click(trigger);
    await user.click(screen.getByRole("button", { name: "Close menu" }));

    // The panel dismisses after the closing shutter, not on the click, so
    // this is deliberately awaited rather than asserted synchronously.
    await waitFor(() =>
      expect(trigger).toHaveAttribute("aria-expanded", "false"),
    );
  });

  it("offers the primary call to action while open", async () => {
    const user = userEvent.setup();
    render(<SiteMenu />);

    await user.click(screen.getByRole("button", { name: "Open menu" }));

    expect(screen.getByRole("link", { name: /join waitlist/i })).toBeVisible();
  });
});
