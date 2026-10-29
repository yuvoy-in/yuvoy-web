import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { addDays, todayIn } from "@/lib/submit/local-day";
import { SubmitFlow } from "./submit-flow";

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

const OPEN = { releases: { checkedCities: "all" } };
const PLACES = {
  markets: [
    {
      key: "bengaluru",
      name: "Bengaluru",
      mode: "discover",
      timezone: "Asia/Kolkata",
      currency: "INR",
      destinations: [
        {
          key: "bengaluru/indiranagar",
          name: "Indiranagar",
          kind: "local",
          visibleTo: "all",
        },
      ],
    },
  ],
};
const VOCABULARY = {
  categories: [
    { key: "events", label: "Events" },
    { key: "food_drink", label: "Food and drink" },
  ],
  activityTypes: [],
  destinations: [],
};
const RECEIPT = {
  id: "6f1c2b0e-8a4d-4c1e-9d55-0d3f0a9c7b21",
  reference: "ES-3F9A12C0",
  codeSentTo: "e•••@example.org",
  expiresAt: "2026-10-30T10:10:00Z",
  message:
    "We sent a 6-digit code to e•••@example.org. It works for 10 minutes.",
};

type Answer = () => Response | Promise<Response>;

/** Each route's answer, by path; anything unlisted fails like a dead host. */
function serve(routes: Record<string, Answer>) {
  vi.mocked(fetch).mockImplementation(async (input) => {
    const path = new URL(String(input)).pathname;
    const answer = routes[path];
    if (!answer) throw new TypeError("Failed to fetch");
    return answer();
  });
}

const open = {
  "/v1/app-config": () => json(200, OPEN),
  "/v1/places": () => json(200, PLACES),
  "/v1/catalog/vocabulary": () => json(200, VOCABULARY),
};

const change = (label: string, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });

async function fillValidEvent(user: ReturnType<typeof userEvent.setup>) {
  change("Event name", "Sunday jazz at the lake");
  await user.selectOptions(
    screen.getByLabelText("What kind of thing is it?"),
    "events",
  );
  await user.selectOptions(
    screen.getByLabelText("Where is it?"),
    "bengaluru/indiranagar",
  );
  change("Venue", "The Lake Stage");
  change("Date", addDays(todayIn("Asia/Kolkata"), 3));
  await user.click(screen.getByLabelText("Free"));
  change("Link to the event page", "https://example.org/jazz");
  change("Organiser name", "Lake Arts Trust");
  change("Your email", "events@example.org");
  await user.click(
    screen.getByLabelText(
      "I organise this event, or I have the organiser's permission to list it.",
    ),
  );
}

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://api.test");
  vi.stubGlobal("fetch", vi.fn());
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("SubmitFlow", () => {
  it("says it is loading, and shows no form, until the release is known", async () => {
    let release: (r: Response) => void = () => {};
    serve({
      ...open,
      "/v1/app-config": () => new Promise<Response>((r) => (release = r)),
    });
    render(<SubmitFlow />);

    expect(screen.getByRole("status")).toHaveTextContent("Loading the form.");
    expect(screen.queryByLabelText("Event name")).toBeNull();

    release(json(200, OPEN));
    expect(await screen.findByLabelText("Event name")).toBeInTheDocument();
  });

  it("is soon, with no form, when checkedCities is not all", async () => {
    serve({
      ...open,
      "/v1/app-config": () =>
        json(200, { releases: { checkedCities: "early" } }),
    });
    render(<SubmitFlow />);

    expect(
      await screen.findByText("Organisers can send us events soon."),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("Event name")).toBeNull();
  });

  it("is soon when the app config cannot be read", async () => {
    serve({
      "/v1/places": open["/v1/places"],
      "/v1/catalog/vocabulary": open["/v1/catalog/vocabulary"],
    });
    render(<SubmitFlow />);
    expect(
      await screen.findByText("Organisers can send us events soon."),
    ).toBeInTheDocument();
  });

  it("offers Try again when places cannot be read, and recovers", async () => {
    let placesUp = false;
    serve({
      ...open,
      "/v1/places": () => (placesUp ? json(200, PLACES) : json(503, {})),
    });
    const user = userEvent.setup();
    render(<SubmitFlow />);

    expect(
      await screen.findByText(
        "We couldn't load the form. Check your connection and try again.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("Event name")).toBeNull();

    placesUp = true;
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByLabelText("Event name")).toBeInTheDocument();
  });

  it("shows the form with the intro, the places and the kinds of thing", async () => {
    serve(open);
    render(<SubmitFlow />);

    expect(await screen.findByLabelText("Event name")).toBeInTheDocument();
    expect(
      screen.getByText(/Organisers, venues and groups can send us an event/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Indiranagar, Bengaluru" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Food and drink" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send to Yuvoy" })).toBeEnabled();
  });

  it("goes to soon when the release closed under an open page", async () => {
    serve({
      ...open,
      "/v1/event-submissions": () =>
        json(404, {
          error: {
            code: "not_found",
            message: "We could not find that submission.",
          },
        }),
    });
    const user = userEvent.setup();
    render(<SubmitFlow />);
    await screen.findByLabelText("Event name");

    await fillValidEvent(user);
    await user.click(screen.getByRole("button", { name: "Send to Yuvoy" }));

    expect(
      await screen.findByText("Organisers can send us events soon."),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("Event name")).toBeNull();
  });

  it("keeps every field when the organiser goes back from the code step", async () => {
    serve({ ...open, "/v1/event-submissions": () => json(202, RECEIPT) });
    const user = userEvent.setup();
    render(<SubmitFlow />);
    await screen.findByLabelText("Event name");

    await fillValidEvent(user);
    await user.click(screen.getByRole("button", { name: "Send to Yuvoy" }));
    expect(await screen.findByText(RECEIPT.message)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Back to the form" }));
    await waitFor(() =>
      expect(screen.getByLabelText("Event name")).toHaveValue(
        "Sunday jazz at the lake",
      ),
    );
    expect(screen.getByLabelText("Your email")).toHaveValue(
      "events@example.org",
    );
    expect(screen.getByLabelText("Free")).toBeChecked();
  });
});
