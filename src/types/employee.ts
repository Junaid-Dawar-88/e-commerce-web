import type { EmployeeStatus, EmployeeAccess } from "@/generated/prisma/enums";

// Single source of truth — mirrors the writable fields of the Prisma `Employee` model.
export type { EmployeeStatus, EmployeeAccess };

export type Employee = {
  id?: string;
  name: string;
  email: string;
  // Optional: on create the server generates a temporary password and emails
  // it; on update it's only set when the user supplies a new one.
  password?: string;
  phone: string;
  role: string;
  department: string;
  // Permission preset the admin assigns (manager | staff). Defaults to staff.
  access?: EmployeeAccess;
  // Admin-granted module/page keys (e.g. ["products","orders"]).
  permissions?: string[];
  status: EmployeeStatus;
  salary: number;
  city: string;
  state: string;
  country: string;
};
