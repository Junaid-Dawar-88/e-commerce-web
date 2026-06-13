import { OrderUpdateInput } from "@/types/order";

const orderApi = "/api/order";

// Staff/admin: every order (with customer + items). Customers: only their own.
export async function getOrders() {
  const res = await fetch(orderApi);
  if (!res.ok) {
    throw new Error("Failed to fetch orders");
  }
  return await res.json();
}

export async function updateOrder(id: string, data: OrderUpdateInput) {
  const res = await fetch(`${orderApi}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error("Failed to update order");
  }
  return await res.json();
}

export async function deleteOrder(id: string) {
  const res = await fetch(`${orderApi}/${id}`, { method: "DELETE" });
  if (!res.ok) {
    throw new Error("Failed to delete order");
  }
  return await res.json();
}
