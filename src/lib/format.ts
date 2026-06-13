// Shared money formatting. Prices are stored as strings on the Product model,
// so parse defensively and fall back to 0 for non-numeric values.
export function toNumber(value: string | number | null | undefined): number {
  if (typeof value === "number") return value
  const n = parseFloat(String(value ?? "").replace(/[^0-9.-]/g, ""))
  return Number.isFinite(n) ? n : 0
}

export function formatPrice(value: string | number | null | undefined): string {
  return toNumber(value).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  })
}
