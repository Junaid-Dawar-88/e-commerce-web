import { authorize } from "@/lib/rbac";
import { deleteEmployee, updateEmployee } from "@/services/employee/employee";
import { logAudit } from "@/services/audit/audit";

// Next.js 16: `params` is a promise and must be awaited.
// Employee `id` is a cuid string, so it is used as-is.
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authz = await authorize("employees:update");
  if (!authz.ok) return authz.response;

  const { id } = await params;
  const body = await req.json();
  const employee = await updateEmployee(id, body);
  const { name, email, role } = authz.user;
  await logAudit({
    action: "permissions" in body ? "Updated access permissions" : "Updated employee",
    category: "employee",
    target: employee.name,
    actor: { name, email, role },
  });
  return Response.json(employee);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authz = await authorize("employees:delete");
  if (!authz.ok) return authz.response;

  const { id } = await params;
  const employee = await deleteEmployee(id);
  const { name, email, role } = authz.user;
  await logAudit({
    action: "Removed employee",
    category: "employee",
    target: employee.name,
    actor: { name, email, role },
  });
  return Response.json(employee);
}
