import { authorize } from "@/lib/rbac";
import { createCustomer, getCustomers } from "@/services/customer/customer";
import { logAudit } from "@/services/audit/audit";

export async function GET() {
  const authz = await authorize("customers:view");
  if (!authz.ok) return authz.response;

  const customers = await getCustomers();
  return Response.json(customers);
}

export async function POST(req: Request) {
  const authz = await authorize("customers:create");
  if (!authz.ok) return authz.response;

  const body = await req.json();
  const customer = await createCustomer(body);
  const { name, email, role } = authz.user;
  await logAudit({
    action: "Added customer",
    category: "customer",
    target: customer.name,
    actor: { name, email, role },
  });
  return Response.json(customer, { status: 201 });
}
