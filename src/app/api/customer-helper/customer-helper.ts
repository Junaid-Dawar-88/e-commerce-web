import { Customer } from "@/types/customer";

const customerApi = "/api/customer";

export async function getCustomers() {
  const res = await fetch(customerApi);

  if (!res.ok) {
    throw new Error("Failed to fetch customers");
  }

  return await res.json();
}

export async function addCustomer(customer: Customer) {
  const res = await fetch(customerApi, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(customer),
  });

  if (!res.ok) {
    throw new Error("Failed to add customer");
  }

  return await res.json();
}

export async function updateCustomer(id: string, customer: Customer) {
  const res = await fetch(`${customerApi}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(customer),
  });

  if (!res.ok) {
    throw new Error("Failed to update customer");
  }

  return await res.json();
}

export async function deleteCustomer(id: string) {
  const res = await fetch(`${customerApi}/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete customer");
  }

  return await res.json();
}
