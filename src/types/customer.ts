import type { CustomerStatus } from "@/generated/prisma/enums";

// Single source of truth — mirrors the Prisma `Customer` model.
export type { CustomerStatus };

export type Customer = {
  id?: string;
  name: string;
  email: string;
  phone: string;
  status: CustomerStatus;
  city: string;
  state: string;
  country: string;
};
