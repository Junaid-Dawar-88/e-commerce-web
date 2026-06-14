// Shared currency formatting. The active currency comes from store Settings
// (default USD). Used everywhere a price is shown so changing the currency in
// Settings reflects across the whole app.

const LOCALE: Record<string, string> = {
  USD: "en-US",
  PKR: "en-PK",
  EUR: "de-DE",
};

export function formatMoney(
  amount: number,
  currency = "USD",
  opts?: Intl.NumberFormatOptions
): string {
  return amount.toLocaleString(LOCALE[currency] ?? "en-US", {
    style: "currency",
    currency,
    ...opts,
  });
}
