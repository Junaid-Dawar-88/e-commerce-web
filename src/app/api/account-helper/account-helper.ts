import { AccountUpdateInput } from "@/types/account";

const accountApi = "/api/account";

export async function getAccount() {
  const res = await fetch(accountApi);

  if (!res.ok) {
    throw new Error("Failed to fetch account");
  }

  return await res.json();
}

export async function updateAccount(input: AccountUpdateInput) {
  const res = await fetch(accountApi, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    throw new Error("Failed to update account");
  }

  return await res.json();
}
