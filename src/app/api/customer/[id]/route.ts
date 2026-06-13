import { authorize } from "@/lib/rbac";
import { deleteCustomer, updateCustomer } from "@/services/customer/customer";

// Next.js 16: `params` is a promise and must be awaited.
// Customer `id` is a cuid string, so it is used as-is.
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authz = await authorize("customer:write");
  if (!authz.ok) return authz.response;

  const { id } = await params;
  const body = await req.json();
  const customer = await updateCustomer(id, body);
  return Response.json(customer);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authz = await authorize("customer:write");
  if (!authz.ok) return authz.response;

  const { id } = await params;
  const customer = await deleteCustomer(id);
  return Response.json(customer);
}
