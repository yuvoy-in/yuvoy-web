import type { Money } from "@/lib/api/types";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** Money (minor units) → display string, e.g. `{450000, INR}` → "₹4,500". */
export function formatMoney(money: Money): string {
  const major = money.amountMinor / 100;
  if (money.currency === "INR") return inr.format(major);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: money.currency,
    maximumFractionDigits: 0,
  }).format(major);
}

/** Minutes → human duration, e.g. 180 → "3 hrs", 90 → "90 min", 480 → "Full day". */
export function formatDuration(minutes: number): string {
  if (minutes >= 420) return "Full day";
  if (minutes < 60) return `${minutes} min`;
  const hours = minutes / 60;
  if (Number.isInteger(hours)) return `${hours} hr${hours > 1 ? "s" : ""}`;
  return `${Math.floor(hours)}h ${minutes % 60}m`;
}

/** ISO date → "12 July 2026". */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}
