import { auth } from "@/auth";
import { permissionAllowed, type Permission, type Role } from "@/lib/permissions";

// Re-export the pure rules so existing imports from "@/lib/rbac" keep working.
export { canAccessPath, permissionAllowed } from "@/lib/permissions";
export type { Permission, Role } from "@/lib/permissions";

export type SessionUser = {
  id: string;
  role: Role;
  modules: string[];
  email?: string | null;
  name?: string | null;
};

export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await auth();
  const user = session?.user;
  if (!user?.id || !user.role) return null;
  return {
    id: user.id,
    role: user.role as Role,
    modules: user.modules ?? [],
    email: user.email,
    name: user.name,
  };
}

export type AuthzResult =
  | { ok: true; user: SessionUser }
  | { ok: false; response: Response };

/**
 * Guard for route handlers. Usage:
 *   const authz = await authorize("product:write");
 *   if (!authz.ok) return authz.response;
 */
export async function authorize(permission: Permission): Promise<AuthzResult> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      ok: false,
      response: Response.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  if (!permissionAllowed(user.role, user.modules, permission)) {
    return {
      ok: false,
      response: Response.json({ error: "Forbidden" }, { status: 403 }),
    };
  }
  return { ok: true, user };
}
