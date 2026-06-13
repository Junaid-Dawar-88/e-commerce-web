import prisma from "@/lib/prisma";
import { Customer } from "@/types/customer";
import { hashPassword } from "@/lib/password";
import { sendSignupWelcomeEmail } from "@/lib/email";

// Shape the writable fields once so create + update stay in sync.
function customerData(customer: Customer) {
  return {
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    status: customer.status,
    city: customer.city,
    state: customer.state,
    country: customer.country,
  };
}

export async function getCustomers() {
  return prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function createCustomer(customer: Customer) {
  return prisma.customer.create({
    data: customerData(customer),
  });
}

export async function updateCustomer(id: string, customer: Customer) {
  return prisma.customer.update({
    where: { id },
    data: customerData(customer),
  });
}

export async function deleteCustomer(id: string) {
  return prisma.customer.delete({
    where: { id },
  });
}

export async function findCustomerByEmail(email: string) {
  return prisma.customer.findUnique({ where: { email } });
}

// Public self-signup: creates a customer login (role "user").
export async function signupCustomer(input: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  city?: string;
  state?: string;
  country?: string;
}) {
  const created = await prisma.customer.create({
    data: {
      name: input.name,
      email: input.email,
      password: hashPassword(input.password),
      phone: input.phone ?? "",
      city: input.city ?? "",
      state: input.state ?? "",
      country: input.country ?? "",
    },
    omit: { password: true },
  });

  // Best-effort welcome email; don't fail signup if the mailer is down.
  try {
    await sendSignupWelcomeEmail(created.email, created.name);
  } catch (err) {
    console.error("[customer] welcome email failed:", err);
  }

  return created;
}
