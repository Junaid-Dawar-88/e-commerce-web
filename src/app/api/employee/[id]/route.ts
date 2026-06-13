import { authorize } from "@/lib/rbac";
import { deleteEmployee, updateEmployee } from "@/services/employee/employee";

// Next.js 16: `params` is a promise and must be awaited.
// Employee `id` is a cuid string, so it is used as-is.
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authz = await authorize("employee:write");
  if (!authz.ok) return authz.response;

  const { id } = await params;
  const body = await req.json();
  const employee = await updateEmployee(id, body);
  return Response.json(employee);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authz = await authorize("employee:write");
  if (!authz.ok) return authz.response;

  const { id } = await params;
  const employee = await deleteEmployee(id);
  return Response.json(employee);
}
