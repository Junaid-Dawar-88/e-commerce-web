import { authorize } from "@/lib/rbac";
import { deleteOrder, updateOrder } from "@/services/order/order";

// Updating/deleting an existing order is a staff/admin action — not a customer's.
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authz = await authorize("order:write");
  if (!authz.ok) return authz.response;
  if (authz.user.role === "user") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const order = await updateOrder(id, body);
  return Response.json(order);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authz = await authorize("order:write");
  if (!authz.ok) return authz.response;
  if (authz.user.role === "user") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const order = await deleteOrder(id);
  return Response.json(order);
}
