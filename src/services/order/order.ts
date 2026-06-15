import prisma from "@/lib/prisma";
import { OrderInput, OrderUpdateInput } from "@/types/order";
import { createNotification } from "@/services/notification/notification";

// Admin / staff: every order.
export async function getOrders() {
  return prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true, customer: true },
  });
}

// A customer: only their own orders.
export async function getOrdersByCustomer(customerId: string) {
  return prisma.order.findMany({
    where: { customerId },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });
}

export async function getOrderById(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: { items: true, customer: true },
  });
}

export async function createOrder(customerId: string, input: OrderInput) {
  const order = await prisma.order.create({
    data: {
      customerId,
      amount: input.amount ?? "0",
      paymentStatus: input.paymentStatus,
      paymentMethod: input.paymentMethod ?? "",
      status: input.status,
      seller: input.seller ?? "",
      shippingAddress: input.shippingAddress ?? "",
      paymentProof: input.paymentProof ?? "",
      items: {
        create: (input.items ?? []).map((item) => ({
          productId: item.productId ?? null,
          name: item.name,
          variant: item.variant ?? "",
          qty: item.qty ?? 1,
          price: item.price ?? "0",
        })),
      },
    },
    include: { items: true, customer: true },
  });

  // Best-effort: notify staff of the new order. Never fail the order if this does.
  try {
    const itemCount = order.items.reduce((sum, i) => sum + i.qty, 0);
    await createNotification({
      category: "orders",
      tone: "success",
      title: "New order placed",
      lines: [
        `${order.customer?.name ?? "A customer"} · Order #${order.id
          .slice(-8)
          .toUpperCase()}`,
        `${itemCount} item${itemCount === 1 ? "" : "s"} · $${order.amount}`,
      ],
    });
  } catch (err) {
    console.error("[order] new-order notification failed:", err);
  }

  return order;
}

export async function updateOrder(id: string, input: OrderUpdateInput) {
  return prisma.order.update({
    where: { id },
    data: {
      amount: input.amount,
      paymentStatus: input.paymentStatus,
      paymentMethod: input.paymentMethod,
      status: input.status,
      seller: input.seller,
      shippingAddress: input.shippingAddress,
    },
    include: { items: true },
  });
}

export async function deleteOrder(id: string) {
  return prisma.order.delete({
    where: { id },
  });
}
