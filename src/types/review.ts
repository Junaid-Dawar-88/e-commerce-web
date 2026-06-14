import type { ReviewStatus } from "@/generated/prisma/enums";

// Single source of truth — mirrors the Prisma `Review` model.
export type { ReviewStatus };

export type ReviewInput = {
  productId?: number | null;
  productName: string;
  customerId?: string | null;
  customerName: string;
  rating: number;
  comment?: string;
  status?: ReviewStatus;
};

export type ReviewUpdateInput = {
  status?: ReviewStatus;
  comment?: string;
  rating?: number;
};
