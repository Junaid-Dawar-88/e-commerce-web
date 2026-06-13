import type { ProductStatus } from "@/generated/prisma/enums";

// Single source of truth — mirrors the Prisma `Product` model.
export type { ProductStatus };

export type Product = {
  id?: number;
  picture: string;
  name: string;
  sku: string;
  category: string;
  seller: string;
  price: string;
  stock: string;
  status: ProductStatus;
  description: string;
  // Relations to Category / Subcategory (optional until the product form
  // selects a real category). `category` above stays as the display name.
  categoryId?: number | null;
  subcategoryId?: number | null;
};
