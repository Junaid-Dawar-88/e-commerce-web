import { authorize } from "@/lib/rbac";
import { createCategory, getCategories } from "@/services/category/category";
import { logAudit } from "@/services/audit/audit";

// Public: anyone can browse the catalog.
export async function GET() {
  const categories = await getCategories();
  return Response.json(categories);
}

export async function POST(req: Request) {
  const authz = await authorize("categories:create");
  if (!authz.ok) return authz.response;

  const body = await req.json();
  const category = await createCategory(body);
  const { name, email, role } = authz.user;
  await logAudit({
    action: "Created category",
    category: "category",
    target: category.name,
    actor: { name, email, role },
  });
  return Response.json(category, { status: 201 });
}
