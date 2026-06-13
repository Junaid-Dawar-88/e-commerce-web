import type { CategoryStatus } from "@/generated/prisma/enums";

// Single source of truth — mirrors the Prisma `Category` / `Subcategory` models.
export type { CategoryStatus };

export type Category = {
  id?: number;
  image: string;
  name: string;
  slug: string;
  description: string;
  status: CategoryStatus;
};

export type Subcategory = {
  id?: number;
  image: string;
  name: string;
  slug: string;
  description: string;
  status: CategoryStatus;
  categoryId: number;
};
