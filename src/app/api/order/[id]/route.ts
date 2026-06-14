import { authorize } from "@/lib/rbac";
import { deleteOrder, updateOrder } from "@/services/order/order";
import { logAudit } from "@/services/audit/audit";

// Updating/deleting an existing order is a staff/admin action — not a customer's.
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authz = await authorize("orders:update");
  if (!authz.ok) return authz.response;
  if (authz.user.role === "user") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const order = await updateOrder(id, body);
  const { name, email, role } = authz.user;
  // Describe the change: a status/payment transition reads better than "updated".
  const action =
    body.paymentStatus === "refunded"
      ? "Refunded order"
      : body.status
        ? `Marked order ${body.status}`
        : "Updated order";
  await logAudit({
    action,
    category: "order",
    target: id,
    actor: { name, email, role },
  });
  return Response.json(order);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authz = await authorize("orders:delete");
  if (!authz.ok) return authz.response;
  if (authz.user.role === "user") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const order = await deleteOrder(id);
  const { name, email, role } = authz.user;
  await logAudit({
    action: "Deleted order",
    category: "order",
    target: id,
    actor: { name, email, role },
  });
  return Response.json(order);
}
