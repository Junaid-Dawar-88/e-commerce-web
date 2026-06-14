import { authorize } from "@/lib/rbac";
import {
  createOrder,
  getOrders,
  getOrdersByCustomer,
} from "@/services/order/order";

export async function GET() {
  const authz = await authorize("orders:view");
  if (!authz.ok) return authz.response;

  // Customers only see their own orders; staff/admin see all.
  const orders =
    authz.user.role === "user"
      ? await getOrdersByCustomer(authz.user.id)
      : await getOrders();

  return Response.json(orders);
}

export async function POST(req: Request) {
  const authz = await authorize("orders:create");
  if (!authz.ok) return authz.response;

  const body = await req.json();

  // A customer can only order for themselves; staff/admin pass a customerId.
  const customerId =
    authz.user.role === "user" ? authz.user.id : body.customerId;

  if (!customerId) {
    return Response.json({ error: "customerId is required" }, { status: 400 });
  }

  const order = await createOrder(customerId, body);
  return Response.json(order, { status: 201 });
}
