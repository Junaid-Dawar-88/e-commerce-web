import type { AuditCategory } from "@/generated/prisma/enums";

// Single source of truth — mirrors the Prisma `AuditLog` model.
export type { AuditCategory };

// What a caller provides when recording an event. The actor is resolved from
// the current session unless explicitly supplied (e.g. during login).
export type AuditInput = {
  action: string;
  category?: AuditCategory;
  target?: string;
  actor?: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  };
};
