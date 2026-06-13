import prisma from "@/lib/prisma";
import { Employee } from "@/types/employee";
import { generatePassword, hashPassword } from "@/lib/password";
import { sendWelcomeEmail } from "@/lib/email";

// Shape the non-password fields once so create + update stay in sync.
function employeeData(employee: Employee) {
  return {
    name: employee.name,
    email: employee.email,
    phone: employee.phone,
    role: employee.role,
    department: employee.department,
    access: employee.access,
    permissions: employee.permissions ?? [],
    status: employee.status,
    salary: employee.salary,
    city: employee.city,
    state: employee.state,
    country: employee.country,
  };
}

// `password` is never returned to the client.
export async function getEmployees() {
  return prisma.employee.findMany({
    orderBy: { createdAt: "desc" },
    omit: { password: true },
  });
}

export async function createEmployee(employee: Employee) {
  // Admin doesn't set the password — generate a temporary one and email it.
  const tempPassword = employee.password?.trim() || generatePassword();

  const created = await prisma.employee.create({
    data: {
      ...employeeData(employee),
      password: hashPassword(tempPassword),
    },
    omit: { password: true },
  });

  // Best-effort welcome email; don't fail creation if the mailer is down.
  try {
    const { sent } = await sendWelcomeEmail(created.email, created.name, tempPassword);
    if (!sent) {
      // SMTP not configured — surface the temp password in the server logs
      // so the account is still usable in development.
      console.warn(
        `[employee] Temp password for ${created.email}: ${tempPassword}`
      );
    }
  } catch (err) {
    console.error("[employee] welcome email failed:", err);
  }

  return created;
}

export async function updateEmployee(id: string, employee: Employee) {
  return prisma.employee.update({
    where: { id },
    data: {
      ...employeeData(employee),
      // Only re-hash when a new password is supplied; otherwise keep the old one.
      ...(employee.password
        ? { password: hashPassword(employee.password) }
        : {}),
    },
    omit: { password: true },
  });
}

export async function deleteEmployee(id: string) {
  return prisma.employee.delete({
    where: { id },
    omit: { password: true },
  });
}
