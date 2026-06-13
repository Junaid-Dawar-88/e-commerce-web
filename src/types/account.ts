import type { Role } from "@/lib/rbac";

// The signed-in user's own account (no password).
export type Account = {
  id: string;
  name: string;
  email: string;
  role: Role;
  notifyEmail: boolean;
  notifyPush: boolean;
  notifySms: boolean;
};

export type AccountUpdateInput = {
  name?: string;
  email?: string;
  password?: string;
  notifyEmail?: boolean;
  notifyPush?: boolean;
  notifySms?: boolean;
};
