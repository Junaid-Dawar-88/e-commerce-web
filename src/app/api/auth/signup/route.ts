import { findCustomerByEmail, signupCustomer } from "@/services/customer/customer";

// Public: anyone can create a customer account (role "user").
export async function POST(req: Request) {
  const body = await req.json();

  if (!body?.name || !body?.email || !body?.password) {
    return Response.json(
      { error: "name, email and password are required" },
      { status: 400 }
    );
  }

  const existing = await findCustomerByEmail(body.email);
  if (existing) {
    return Response.json({ error: "Email already in use" }, { status: 409 });
  }

  const customer = await signupCustomer(body);
  return Response.json(customer, { status: 201 });
}
