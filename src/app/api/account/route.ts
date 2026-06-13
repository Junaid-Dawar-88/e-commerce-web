import { getCurrentUser } from "@/lib/rbac";
import { getAccount, updateAccount } from "@/services/account/account";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const account = await getAccount(user);
  if (!account) {
    return Response.json({ error: "Account not found" }, { status: 404 });
  }

  return Response.json(account);
}

export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.role === "admin") {
    return Response.json(
      { error: "The admin account is managed via environment variables." },
      { status: 400 }
    );
  }

  const body = await req.json();
  const account = await updateAccount(user, body);
  return Response.json(account);
}
