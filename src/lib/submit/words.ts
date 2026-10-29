/**
 * Every sentence the `/submit` page writes itself, in one place.
 *
 * The page's words are the spec's (R3-b, Clients), restated by yuvoy-web#177;
 * the field errors are the same strings the API sends in `details`, so a
 * refusal reads the same whether the page or the server caught it. Words the
 * API owns (the receipt's `message`, every 404, 409, 429 and 503 sentence) are
 * not here: they are shown as sent, and may change with no change to this
 * file.
 *
 * Straight apostrophes on purpose. These are the issue's strings character for
 * character, and the API writes its own the same way.
 */
export const WORDS = {
  soon: "Organisers can send us events soon.",
  heading: "Tell us about your event",
  intro:
    "Organisers, venues and groups can send us an event in a place on Yuvoy. A person at Yuvoy checks every event before it shows. It's free.",

  // Provisional (note R3-T3-web section 6 point 3), with @gamallasaiteja.
  loadFailed: "We couldn't load the form. Check your connection and try again.",
  tryAgain: "Try again",
  loading: "Loading the form.",

  labels: {
    title: "Event name",
    department: "What kind of thing is it?",
    destinationKey: "Where is it?",
    venue: "Venue",
    address: "Address or area (optional)",
    startsOn: "Date",
    startTime: "Start time (optional)",
    endsOn: "End date (optional)",
    endTime: "End time (optional)",
    price: "Price",
    free: "Free",
    paid: "Paid",
    priceFrom: "Lowest ticket price (₹)",
    priceTo: "Highest ticket price (₹, optional)",
    officialUrl: "Link to the event page",
    summary: "About it, in a sentence or two (optional)",
    organiserName: "Organiser name",
    email: "Your email",
    consent:
      "I organise this event, or I have the organiser's permission to list it.",
    extra: "Leave this empty",
    choose: "Choose one",
  },

  help: {
    officialUrl: "Your own page or your ticket page. We link to it as it is.",
    email: "We send a code to check it's you. We never show it on Yuvoy.",
  },

  send: "Send to Yuvoy",

  errors: {
    title: "Give the event a name of 3 to 120 characters.",
    department: "Pick what kind of thing it is.",
    destinationKey: "Pick where it is.",
    venue: "Name the venue.",
    startsOn: "Pick a date from today up to a year ahead.",
    endsOn:
      "The end date can't be before the start, or more than 30 days after it.",
    endTime: "The end time must be after the start time.",
    time: "Give a time from 00:00 to 23:59.",
    priceFrom: "Enter the lowest ticket price in rupees, from 1 to 1,00,000.",
    // Not in the issue: its pair for the highest price, which has no words
    // there. With @gamallasaiteja.
    priceTo: "Enter the highest ticket price in rupees, from 1 to 1,00,000.",
    priceBelow: "The highest price can't be below the lowest.",
    officialUrl: "Paste a link that starts with https:// or http://.",
    organiserName: "Name the organiser.",
    email: "Enter an email address we can send a code to.",
    consent: "Tick this to confirm you can list the event.",
    // The API's own sentences for limits the issue gives no words for
    // (note section 6 point 6). With @gamallasaiteja.
    address: "An address can be at most 300 characters.",
    isFree: "Say whether it is free or paid.",
    officialUrlLength: "Paste a link of at most 2048 characters.",
    summary: "Say it in at most 500 characters.",
    code: "Enter the 6-digit code from the email.",
  },

  failed: "That didn't send. Check your connection and try again.",
  offline: "You're offline. Your answers are kept here.",

  code: {
    heading: "Check your email",
    label: "Code",
    confirm: "Confirm",
    resend: "Send a new code",
    back: "Back to the form",
  },

  done: {
    reference: (reference: string) => `Your reference is ${reference}.`,
    another: "Send another event",
  },
} as const;
