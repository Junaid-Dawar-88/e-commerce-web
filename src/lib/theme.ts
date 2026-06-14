// UI theme preference, persisted per-user in Neon (customers/employees).
// Pure module — safe to import from both client and server components.

export type Theme = "light" | "dark" | "system";

export const THEMES: Theme[] = ["light", "dark", "system"];

export function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark" || value === "system";
}
