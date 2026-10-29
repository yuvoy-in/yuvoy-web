import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { resendCode, verifyCode } from "@/lib/submit/api";
import { CodeStep } from "./code-step";

vi.mock("@/lib/submit/api", () => ({
  verifyCode: vi.fn(),
  resendCode: vi.fn(),
}));

const RECEIPT = {
  id: "6f1c2b0e-8a4d-4c1e-9d55-0d3f0a9c7b21",
  reference: "ES-3F9A12C0",
  message:
    "We sent a 6-digit code to e•••@example.org. It works for 10 minutes.",
};

function setup() {
  const onConfirmed = vi.fn();
  const onBack = vi.fn();
  render(
    <CodeStep
      receipt={RECEIPT}
      online
      onConfirmed={onConfirmed}
      onBack={onBack}
    />,
  );
  return { user: userEvent.setup(), onConfirmed, onBack };
}

beforeEach(() => {
  vi.mocked(verifyCode).mockReset();
  vi.mocked(resendCode).mockReset();
});

describe("CodeStep", () => {
  it("shows the receipt's message as sent", () => {
    setup();
    expect(
      screen.getByRole("heading", { name: "Check your email" }),
    ).toBeInTheDocument();
    expect(screen.getByText(RECEIPT.message)).toBeInTheDocument();
  });

  it("asks for a numeric one-time code", () => {
    setup();
    const field = screen.getByLabelText("Code");
    expect(field).toHaveAttribute("inputmode", "numeric");
    expect(field).toHaveAttribute("autocomplete", "one-time-code");
  });

  it("checks for 6 digits before it calls", async () => {
    const { user } = setup();
    await user.type(screen.getByLabelText("Code"), "123");
    await user.click(screen.getByRole("button", { name: "Confirm" }));

    expect(
      await screen.findByText("Enter the 6-digit code from the email."),
    ).toHaveAttribute("role", "alert");
    expect(screen.getByLabelText("Code")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(verifyCode).not.toHaveBeenCalled();
  });

  it("sends a pasted code without its space", async () => {
    vi.mocked(verifyCode).mockResolvedValue({
      kind: "confirmed",
      confirmation: { reference: "ES-3F9A12C0", message: "Thanks." },
    });
    const { user, onConfirmed } = setup();
    await user.type(screen.getByLabelText("Code"), "123 456");
    await user.click(screen.getByRole("button", { name: "Confirm" }));

    await waitFor(() =>
      expect(onConfirmed).toHaveBeenCalledWith({
        reference: "ES-3F9A12C0",
        message: "Thanks.",
      }),
    );
    expect(verifyCode).toHaveBeenCalledWith(RECEIPT.id, "123456");
  });

  it("on a wrong code, says so, empties the box and keeps the event", async () => {
    vi.mocked(verifyCode).mockResolvedValue({
      kind: "wrong_code",
      message: "That code did not work. Ask for a new one.",
    });
    const { user, onConfirmed, onBack } = setup();
    await user.type(screen.getByLabelText("Code"), "000000");
    await user.click(screen.getByRole("button", { name: "Confirm" }));

    expect(
      await screen.findByText("That code did not work. Ask for a new one."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Code")).toHaveValue("");
    // Still on this step, with the way back to the event.
    expect(onConfirmed).not.toHaveBeenCalled();
    expect(onBack).not.toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: "Back to the form" }),
    ).toBeEnabled();
  });

  it("replaces the message when a new code is sent", async () => {
    vi.mocked(resendCode).mockResolvedValue({
      kind: "sent",
      receipt: {
        ...RECEIPT,
        message: "We sent a new code to e•••@example.org.",
      },
    });
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: "Send a new code" }));

    expect(
      await screen.findByText("We sent a new code to e•••@example.org."),
    ).toBeInTheDocument();
    expect(screen.queryByText(RECEIPT.message)).toBeNull();
    expect(resendCode).toHaveBeenCalledWith(RECEIPT.id);
  });

  it("treats already with our team as done, with the reference it holds", async () => {
    vi.mocked(verifyCode).mockResolvedValue({
      kind: "with_team",
      message: "This event is already with our team.",
    });
    const { user, onConfirmed } = setup();
    await user.type(screen.getByLabelText("Code"), "123456");
    await user.click(screen.getByRole("button", { name: "Confirm" }));

    await waitFor(() =>
      expect(onConfirmed).toHaveBeenCalledWith({
        reference: "ES-3F9A12C0",
        message: "This event is already with our team.",
      }),
    );
  });

  it("goes back to the form on request", async () => {
    const { user, onBack } = setup();
    await user.click(screen.getByRole("button", { name: "Back to the form" }));
    expect(onBack).toHaveBeenCalled();
  });
});
