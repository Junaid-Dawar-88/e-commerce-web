import { authorize } from "@/lib/rbac";
import { createCustomer, getCustomers } from "@/services/customer/customer";

export async function GET() {
  const authz = await authorize("customer:read");
  if (!authz.ok) return authz.response;

  const customers = await getCustomers();
  return Response.json(customers);
}

export async function POST(req: Request) {
  const authz = await authorize("customer:write");
  if (!authz.ok) return authz.response;

  const body = await req.json();
  const customer = await createCustomer(body);
  return Response.json(customer, { status: 201 });
}
