/**
 * Calendar days as `YYYY-MM-DD`, in a place's own zone.
 *
 * The API checks `startsOn` against the place's local today (the market's
 * `timezone`), not the visitor's. Someone in London sending a Bengaluru event
 * at 23:30 their time is already on the next day there, and a date picker
 * that used the browser's zone would offer a day the server refuses.
 *
 * Days are plain strings throughout. `YYYY-MM-DD` sorts as it reads, so
 * comparing two is comparing two strings, and arithmetic goes through UTC
 * midnight where no day is ever 23 or 25 hours long.
 */

/** "From the place's local today up to 365 days ahead." */
export const DAYS_AHEAD = 365;
/** An end date "at most 30 days after" the start. */
export const LONGEST_RUN = 30;

const DAY = /^(\d{4})-(\d{2})-(\d{2})$/;
const MS_PER_DAY = 86_400_000;

/** Today in `timeZone`. An unknown zone falls back to UTC; the server checks again. */
export function todayIn(timeZone: string, now: Date = new Date()): string {
  let parts: Intl.DateTimeFormatPart[];
  try {
    parts = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(now);
  } catch {
    return now.toISOString().slice(0, 10);
  }
  const part = (type: string) => parts.find((p) => p.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function toUtc(day: string): number | null {
  const match = DAY.exec(day);
  if (!match) return null;
  const [, y, m, d] = match.map(Number);
  const time = Date.UTC(y, m - 1, d);
  // Date.UTC rolls 2026-02-30 over to March; a real day survives the trip.
  return new Date(time).toISOString().slice(0, 10) === day ? time : null;
}

/** Whether `day` is a real calendar day written as `YYYY-MM-DD`. */
export function isDay(day: string): boolean {
  return toUtc(day) !== null;
}

/** `day` moved by `days`. `day` must be a real day. */
export function addDays(day: string, days: number): string {
  const time = toUtc(day);
  if (time === null) throw new RangeError(`not a day: ${day}`);
  return new Date(time + days * MS_PER_DAY).toISOString().slice(0, 10);
}

/** The first and last day a start date may take, given the place's today. */
export function startBounds(today: string): { min: string; max: string } {
  return { min: today, max: addDays(today, DAYS_AHEAD) };
}

/** Whether `start` falls from `today` up to 365 days ahead. */
export function startInRange(start: string, today: string): boolean {
  if (!isDay(start) || !isDay(today)) return false;
  const { min, max } = startBounds(today);
  return start >= min && start <= max;
}

/** Whether `end` is on or after `start` and at most 30 days after it. */
export function endInRun(start: string, end: string): boolean {
  if (!isDay(start) || !isDay(end)) return false;
  return end >= start && end <= addDays(start, LONGEST_RUN);
}
