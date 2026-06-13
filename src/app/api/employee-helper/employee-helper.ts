import { Employee } from "@/types/employee";

const employeeApi = "/api/employee";

export async function getEmployees() {
  const res = await fetch(employeeApi);

  if (!res.ok) {
    throw new Error("Failed to fetch employees");
  }

  return await res.json();
}

export async function addEmployee(employee: Employee) {
  const res = await fetch(employeeApi, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(employee),
  });

  if (!res.ok) {
    throw new Error("Failed to add employee");
  }

  return await res.json();
}

export async function updateEmployee(id: string, employee: Employee) {
  const res = await fetch(`${employeeApi}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(employee),
  });

  if (!res.ok) {
    throw new Error("Failed to update employee");
  }

  return await res.json();
}

export async function deleteEmployee(id: string) {
  const res = await fetch(`${employeeApi}/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete employee");
  }

  return await res.json();
}
