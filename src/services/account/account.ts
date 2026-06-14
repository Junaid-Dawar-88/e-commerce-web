import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import type { SessionUser } from "@/lib/rbac";
import { isTheme, type Theme } from "@/lib/theme";
import type { Account, AccountUpdateInput } from "@/types/account";

// The signed-in user's account lives in customers (role "user") or employees
// (manager/staff). The admin is env-based and has no editable DB record.
export async function getAccount(user: SessionUser): Promise<Account | null> {
  if (user.role === "admin") {
    return {
      id: user.id,
      name: user.name ?? "Admin",
      email: user.email ?? "",
      role: "admin",
      notifyEmail: true,
      notifyPush: true,
      notifySms: false,
    };
  }

  if (user.role === "user") {
    const c = await prisma.customer.findUnique({ where: { id: user.id } });
    if (!c) return null;
    return {
      id: c.id,
      name: c.name,
      email: c.email,
      role: "user",
      notifyEmail: c.notifyEmail,
      notifyPush: c.notifyPush,
      notifySms: c.notifySms,
    };
  }

  const e = await prisma.employee.findUnique({ where: { id: user.id } });
  if (!e) return null;
  return {
    id: e.id,
    name: e.name,
    email: e.email,
    role: user.role,
    notifyEmail: e.notifyEmail,
    notifyPush: e.notifyPush,
    notifySms: e.notifySms,
  };
}

export async function updateAccount(
  user: SessionUser,
  input: AccountUpdateInput
): Promise<Account> {
  if (user.role === "admin") {
    throw new Error("ADMIN_ACCOUNT_IMMUTABLE");
  }

  const data = {
    name: input.name,
    email: input.email,
    notifyEmail: input.notifyEmail,
    notifyPush: input.notifyPush,
    notifySms: input.notifySms,
    // Only re-hash when a new password was supplied.
    password: input.password ? hashPassword(input.password) : undefined,
  };

  if (user.role === "user") {
    const c = await prisma.customer.update({ where: { id: user.id }, data });
    return {
      id: c.id,
      name: c.name,
      email: c.email,
      role: "user",
      notifyEmail: c.notifyEmail,
      notifyPush: c.notifyPush,
      notifySms: c.notifySms,
    };
  }

  const e = await prisma.employee.update({ where: { id: user.id }, data });
  return {
    id: e.id,
    name: e.name,
    email: e.email,
    role: user.role,
    notifyEmail: e.notifyEmail,
    notifyPush: e.notifyPush,
    notifySms: e.notifySms,
  };
}

// The user's saved UI theme. The env-based admin has no DB row, so it always
// falls back to "system".
export async function getTheme(user: SessionUser): Promise<Theme> {
  if (user.role === "admin") return "system";

  const row =
    user.role === "user"
      ? await prisma.customer.findUnique({
          where: { id: user.id },
          select: { theme: true },
        })
      : await prisma.employee.findUnique({
          where: { id: user.id },
          select: { theme: true },
        });

  return isTheme(row?.theme) ? row.theme : "system";
}

// Persist the user's theme. No-op for the env admin (nothing to write to).
export async function setTheme(user: SessionUser, theme: Theme): Promise<void> {
  if (user.role === "admin") return;

  if (user.role === "user") {
    await prisma.customer.update({ where: { id: user.id }, data: { theme } });
    return;
  }
  await prisma.employee.update({ where: { id: user.id }, data: { theme } });
}
