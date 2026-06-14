// Pure, edge-safe RBAC rules. NO server/prisma/auth imports here, so this can
// be imported from middleware (edge) and client components alike.

export type Role = "admin" | "manager" | "staff" | "user";

// The levels of access an admin can grant per page:
//   view   → open the page (read).
//   create → add new records.
//   update → edit existing records.
//   delete → remove records.
export type Action = "view" | "create" | "update" | "delete";

// Write actions in display order (view is implicit and always listed first).
export const WRITE_ACTIONS: Action[] = ["create", "update", "delete"];

// A "module" = an admin page whose access the admin grants per-employee.
export type ModuleKey =
  | "products"
  | "categories"
  | "customers"
  | "orders"
  | "employees"
  | "notifications"
  | "reports"
  | "payments"
  | "reviews"
  | "settings";

// A capability/permission token used both to store grants and to guard API
// routes, e.g. "products:create". `view` is the read permission.
export type Permission = `${ModuleKey}:${Action}`;

// Each module: label, the page it unlocks, and the write actions it supports
// (beyond viewing). Read-only pages (Reports/Payments) support none; Settings
// only supports saving (update).
export const MODULES: {
  key: ModuleKey;
  label: string;
  page: string;
  actions: Action[];
}[] = [
  { key: "products", label: "Products", page: "/admin/product", actions: ["create", "update", "delete"] },
  { key: "categories", label: "Categories", page: "/admin/categories", actions: ["create", "update", "delete"] },
  { key: "customers", label: "Customers", page: "/admin/customer", actions: ["create", "update", "delete"] },
  { key: "orders", label: "Orders", page: "/admin/order", actions: ["create", "update", "delete"] },
  { key: "employees", label: "Employees", page: "/admin/employee", actions: ["create", "update", "delete"] },
  { key: "notifications", label: "Notifications", page: "/admin/notification", actions: ["create", "update", "delete"] },
  { key: "reports", label: "Reports", page: "/admin/report", actions: [] },
  { key: "payments", label: "Payments", page: "/admin/payment", actions: [] },
  { key: "reviews", label: "Reviews", page: "/admin/reviews", actions: ["create", "update", "delete"] },
  { key: "settings", label: "Settings", page: "/admin/setting", actions: ["update"] },
];

export const ALL_MODULES: ModuleKey[] = MODULES.map((m) => m.key);

const isModuleKey = (k: string): k is ModuleKey =>
  ALL_MODULES.includes(k as ModuleKey);

function moduleActions(key: ModuleKey): Action[] {
  return MODULES.find((m) => m.key === key)?.actions ?? [];
}

// Does this module expose write actions at all? (Reports/Payments don't.)
export function moduleHasActions(key: ModuleKey): boolean {
  return moduleActions(key).length > 0;
}

// All capability tokens for a module: view + each of its write actions.
function tokensFor(key: ModuleKey): string[] {
  return [`${key}:view`, ...moduleActions(key).map((a) => `${key}:${a}`)];
}

// Expand a stored grant list into canonical tokens, upgrading legacy formats:
//   bare key "products"  → full access (view + all actions)
//   "products:manage"    → full access (the previous single write flag)
// and ensuring any granted action also implies "view".
export function normalizeGrants(stored?: string[] | null): string[] {
  const out = new Set<string>();
  for (const raw of stored ?? []) {
    const [key, cap] = raw.split(":");
    if (!isModuleKey(key)) continue;
    if (cap === "view") {
      out.add(`${key}:view`);
    } else if (!cap || cap === "manage") {
      tokensFor(key).forEach((t) => out.add(t));
    } else if ((moduleActions(key) as string[]).includes(cap)) {
      out.add(`${key}:${cap}`);
      out.add(`${key}:view`); // an action implies the ability to view the page
    }
  }
  return [...out];
}

// Pages every panel user (admin/manager/staff) can always open.
const ALWAYS_PAGES = ["/admin/dashboard", "/admin/account"];

// Optional starting templates the admin can apply with one click in Settings.
// These are NOT auto-granted: a new employee starts with no access until the
// admin grants it from Settings → Users & Roles.
export const DEFAULT_MODULES: Record<"manager" | "staff", ModuleKey[]> = {
  manager: ["products", "categories", "customers", "orders", "notifications", "reports", "payments", "reviews"],
  staff: ["products", "orders", "notifications"],
};

// Expand a role preset into full-access tokens for its listed modules.
export function presetGrants(access: "manager" | "staff"): string[] {
  return DEFAULT_MODULES[access].flatMap(tokensFor);
}

// Full access to every module — the "Grant all" shortcut.
export function fullAccessGrants(): string[] {
  return ALL_MODULES.flatMap(tokensFor);
}

// What a signed-up customer (role "user") can do: browse products, place and
// view their own orders.
const USER_GRANTS = new Set<string>([
  "products:view",
  "orders:view",
  "orders:create",
]);

// Resolve the capability tokens a user effectively holds. The result is stored
// on the session (`user.modules`) and read by the guards below.
export function effectiveModules(
  role: Role | undefined | null,
  stored?: string[] | null
): string[] {
  if (role === "admin") return fullAccessGrants();
  if (role === "manager" || role === "staff") return normalizeGrants(stored);
  return [];
}

function moduleForPath(path: string): ModuleKey | null {
  const match = MODULES.filter(
    (m) => path === m.page || path.startsWith(m.page + "/")
  ).sort((a, b) => b.page.length - a.page.length)[0];
  return match?.key ?? null;
}

// Can this user open this admin path?
export function canAccessPath(
  role: Role | undefined | null,
  modules: string[] | undefined | null,
  path: string
): boolean {
  if (!role || role === "user") return false;
  if (role === "admin") return true;
  if (ALWAYS_PAGES.some((p) => path === p || path.startsWith(p + "/"))) {
    return true;
  }
  const mod = moduleForPath(path);
  if (!mod) return false; // unknown admin path → only admin (handled above)
  // normalizeGrants guarantees a "view" token whenever any action is granted.
  return new Set(normalizeGrants(modules)).has(`${mod}:view`);
}

// Core check: may this user perform `action` on `key`?
export function can(
  role: Role | undefined | null,
  modules: string[] | undefined | null,
  key: ModuleKey,
  action: Action
): boolean {
  if (!role) return false;
  if (role === "admin") return true;
  if (role === "user") return USER_GRANTS.has(`${key}:${action}`);
  return new Set(normalizeGrants(modules)).has(`${key}:${action}`);
}

// Does this user hold the given API permission (e.g. "products:create")?
export function permissionAllowed(
  role: Role | undefined | null,
  modules: string[] | undefined | null,
  permission: Permission
): boolean {
  const [key, action] = permission.split(":") as [ModuleKey, Action];
  if (!isModuleKey(key)) return false;
  return can(role, modules, key, action);
}
