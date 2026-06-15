import type { OrderStatus, PaymentStatus } from "@/generated/prisma/enums";

// Single source of truth — mirrors the Prisma `Order` / `OrderItem` models.
export type { OrderStatus, PaymentStatus };

export type OrderItemInput = {
  productId?: number | null;
  name: string;
  variant?: string;
  qty?: number;
  price?: string;
};

export type OrderInput = {
  amount?: string;
  paymentStatus?: PaymentStatus;
  paymentMethod?: string;
  status?: OrderStatus;
  seller?: string;
  shippingAddress?: string;
  paymentProof?: string;
  items?: OrderItemInput[];
};

// Fields an admin/staff may change on an existing order (never the items).
export type OrderUpdateInput = {
  amount?: string;
  paymentStatus?: PaymentStatus;
  paymentMethod?: string;
  status?: OrderStatus;
  seller?: string;
  shippingAddress?: string;
};
