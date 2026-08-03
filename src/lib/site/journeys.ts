/**
 * The two journeys, step by step.
 *
 * **Read the `status` field before editing any of this.** Almost none of this
 * exists yet: there is no booking engine, no payment flow, no operator portal
 * and no payouts. A step marked `planned` must never be written in a way that
 * implies a visitor could do it today — that is the single rule this file
 * exists to hold.
 *
 * `now` is reserved for the one thing that genuinely works: an operator can
 * apply, today, through the same waitlist a traveller uses.
 */
export type StepStatus = "now" | "planned";

export interface JourneyStep {
  title: string;
  body: string;
  status: StepStatus;
}

export interface Journey {
  key: "traveller" | "operator";
  audience: string;
  title: string;
  accent: string;
  lede: string;
  cta: { label: string; href: string };
  steps: JourneyStep[];
}

export const TRAVELLER_JOURNEY: Journey = {
  key: "traveller",
  audience: "For travellers",
  title: "From watching",
  accent: "to going.",
  lede: "Eight steps from opening the app to stepping off the boat. Only the last part of this is built; everything below is the journey we are building, described honestly.",
  cta: { label: "Join the traveller waitlist", href: "/waitlist" },
  steps: [
    {
      title: "Watch short experience videos",
      body: "A feed of real days on the water, in kitchens and along trails, filmed by the people who run them.",
      status: "planned",
    },
    {
      title: "Open an experience",
      body: "Everything about a single day in one place, rather than scattered across a brochure and a phone call.",
      status: "planned",
    },
    {
      title: "Meet the local host",
      body: "Who is actually running the day, what they do, and how long they have been doing it.",
      status: "planned",
    },
    {
      title: "Check the itinerary, inclusions, safety and requirements",
      body: "What the day involves, what is provided, what you need to bring, and what it asks of you physically.",
      status: "planned",
    },
    {
      title: "Select a date and group size",
      body: "Choosing from an operator's real calendar is part of the build. No dates are selectable today.",
      status: "planned",
    },
    {
      title: "Pay and receive confirmation",
      body: "Payments are not built. Nothing on Yuvoy can be paid for today, and no card or UPI details are collected anywhere on this site.",
      status: "planned",
    },
    {
      title: "Get directions, reminders and support",
      body: "Meeting point, timings and a person to contact, planned to arrive before the day, not on the morning.",
      status: "planned",
    },
    {
      title: "Attend the experience, and tell us how it went",
      body: "What travellers tell us afterwards is how the next season gets better. This comes last, once there is something to attend.",
      status: "planned",
    },
  ],
};

export const OPERATOR_JOURNEY: Journey = {
  key: "operator",
  audience: "For operators",
  title: "From applying",
  accent: "to running full days.",
  lede: "The first step is open right now. The rest is what we are building with the operators who join before launch, including the commercial detail, which is not set and will be agreed with you rather than announced at you.",
  cta: {
    label: "Apply as a founding operator",
    href: "/waitlist?audience=provider",
  },
  steps: [
    {
      title: "Apply to join Yuvoy",
      body: "This part is live. Tell us who you are, where you operate and what you run, and a person reads it.",
      status: "now",
    },
    {
      title: "Complete identity and business verification",
      body: "A verification process is being designed. It does not exist yet, so nothing on this site claims any operator has passed one.",
      status: "planned",
    },
    {
      title: "Create the experience with Yuvoy",
      body: "We plan to build the first listings alongside you rather than handing you a form and wishing you luck.",
      status: "planned",
    },
    {
      title: "Capture honest video content",
      body: "Filmed as the day actually is. No staging, no stock footage, no borrowed clips of somewhere else.",
      status: "planned",
    },
    {
      title: "Set pricing, availability and capacity",
      body: "Your prices, your calendar, your limits. The tooling for this is being built; you set nothing on Yuvoy today.",
      status: "planned",
    },
    {
      title: "Receive bookings",
      body: "Bookings are not live. No traveller can book anything through Yuvoy today, from any operator.",
      status: "planned",
    },
    {
      title: "Run the experience",
      body: "The part you already do well. Everything we build is meant to get out of the way of it.",
      status: "planned",
    },
    {
      title: "Receive payout and traveller feedback",
      body: "Payouts do not exist and no settlement terms have been agreed. This is planned work, not an offer.",
      status: "planned",
    },
  ],
};

export const JOURNEYS = [TRAVELLER_JOURNEY, OPERATOR_JOURNEY];
