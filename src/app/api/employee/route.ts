import { authorize } from "@/lib/rbac";
import { createEmployee, getEmployees } from "@/services/employee/employee";

export async function GET() {
  const authz = await authorize("employee:read");
  if (!authz.ok) return authz.response;

  const employees = await getEmployees();
  return Response.json(employees);
}

export async function POST(req: Request) {
  const authz = await authorize("employee:write");
  if (!authz.ok) return authz.response;

  const body = await req.json();
  const employee = await createEmployee(body);
  return Response.json(employee, { status: 201 });
}
