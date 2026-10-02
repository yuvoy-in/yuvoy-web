import type { components } from "@/lib/api/schema";

/**
 * Money is `amountMinor`: an integer in the currency's minor unit. ₹4,500 is
 * 450000. There are no float rupees anywhere in the API.
 *
 * The same rules as yuvoy-app's `src/lib/format/money.ts`, so a price reads
 * the same here as it does one tap later in the app. Format at the render
 * edge; never store the formatted value.
 */
export type Money = components["schemas"]["Money"];

const MINOR_UNITS: Record<string, number> = { INR: 2, USD: 2, EUR: 2, JPY: 0 };

/**
 * Whole amounts drop the decimals: "₹4,500" reads as a price, "₹4,500.00"
 * reads as an invoice.
 */
export function formatMoney(money: Money): string {
  const digits = MINOR_UNITS[money.currency] ?? 2;
  const factor = 10 ** digits;
  const showMinor = money.amountMinor % factor !== 0;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: money.currency,
    minimumFractionDigits: showMinor ? digits : 0,
    maximumFractionDigits: showMinor ? digits : 0,
  }).format(money.amountMinor / factor);
}
