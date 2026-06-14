import { authorize } from "@/lib/rbac";
import { createEmployee, getEmployees } from "@/services/employee/employee";
import { logAudit } from "@/services/audit/audit";

export async function GET() {
  const authz = await authorize("employees:view");
  if (!authz.ok) return authz.response;

  const employees = await getEmployees();
  return Response.json(employees);
}

export async function POST(req: Request) {
  const authz = await authorize("employees:create");
  if (!authz.ok) return authz.response;

  const body = await req.json();
  const employee = await createEmployee(body);
  const { name, email, role } = authz.user;
  await logAudit({
    action: "Added employee",
    category: "employee",
    target: employee.name,
    actor: { name, email, role },
  });
  return Response.json(employee, { status: 201 });
}
