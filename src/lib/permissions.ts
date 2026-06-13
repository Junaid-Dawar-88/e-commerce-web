// Pure, edge-safe RBAC rules. NO server/prisma/auth imports here, so this can
// be imported from middleware (edge) and client components alike.

export type Role = "admin" | "manager" | "staff" | "user";

// resource:action permissions (used to guard API routes).
export type Permission =
  | "product:read"
  | "product:write"
  | "category:read"
  | "category:write"
  | "customer:read"
  | "customer:write"
  | "employee:read"
  | "employee:write"
  | "order:read"
  | "order:write"
  | "notification:read"
  | "notification:write";

// A "module" = an admin page the admin can grant per-employee.
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

// Each module: its label, the page it unlocks, and the API permissions it grants.
export const MODULES: {
  key: ModuleKey;
  label: string;
  page: string;
  permissions: Permission[];
}[] = [
  { key: "products", label: "Products", page: "/admin/product", permissions: ["product:read", "product:write"] },
  { key: "categories", label: "Categories", page: "/admin/categories", permissions: ["category:read", "category:write"] },
  { key: "customers", label: "Customers", page: "/admin/customer", permissions: ["customer:read", "customer:write"] },
  { key: "orders", label: "Orders", page: "/admin/order", permissions: ["order:read", "order:write"] },
  { key: "employees", label: "Employees", page: "/admin/employee", permissions: ["employee:read", "employee:write"] },
  { key: "notifications", label: "Notifications", page: "/admin/notification", permissions: ["notification:read", "notification:write"] },
  { key: "reports", label: "Reports", page: "/admin/report", permissions: [] },
  { key: "payments", label: "Payments", page: "/admin/payment", permissions: [] },
  { key: "reviews", label: "Reviews", page: "/admin/reviews", permissions: [] },
  { key: "settings", label: "Settings", page: "/admin/setting", permissions: [] },
];

export const ALL_MODULES: ModuleKey[] = MODULES.map((m) => m.key);

// Pages every panel user (admin/manager/staff) can always open.
const ALWAYS_PAGES = ["/admin/dashboard", "/admin/account"];

// Optional starting templates the admin can apply with one click in Settings.
// These are NOT auto-granted: a new employee starts with no page access until
// the admin grants pages from Settings → Users & Roles.
export const DEFAULT_MODULES: Record<"manager" | "staff", ModuleKey[]> = {
  manager: ["products", "categories", "customers", "orders", "notifications", "reports", "payments", "reviews"],
  staff: ["products", "orders", "notifications"],
};

// Permissions a signed-up customer gets (browse products + own orders).
const USER_PERMISSIONS: Permission[] = ["product:read", "order:read", "order:write"];

// Resolve the modules a user effectively has.
export function effectiveModules(
  role: Role | undefined | null,
  stored?: string[] | null
): ModuleKey[] {
  if (role === "admin") return ALL_MODULES;
  if (role === "manager" || role === "staff") {
    // Only what the admin has explicitly granted — no implicit preset.
    // A brand-new employee therefore has no page access until granted.
    return (stored ?? []).filter((m): m is ModuleKey =>
      ALL_MODULES.includes(m as ModuleKey)
    );
  }
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
  return (modules ?? []).includes(mod);
}

// Does this user hold the given API permission?
export function permissionAllowed(
  role: Role | undefined | null,
  modules: string[] | undefined | null,
  permission: Permission
): boolean {
  if (!role) return false;
  if (role === "admin") return true;
  if (role === "user") return USER_PERMISSIONS.includes(permission);
  // manager / staff — derive from granted modules.
  const granted = modules ?? [];
  return MODULES.some(
    (m) => granted.includes(m.key) && m.permissions.includes(permission)
  );
}
