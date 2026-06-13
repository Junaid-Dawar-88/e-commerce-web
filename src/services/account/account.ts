import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import type { SessionUser } from "@/lib/rbac";
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
