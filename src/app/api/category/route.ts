import { authorize } from "@/lib/rbac";
import { createCategory, getCategories } from "@/services/category/category";

// Public: anyone can browse the catalog.
export async function GET() {
  const categories = await getCategories();
  return Response.json(categories);
}

export async function POST(req: Request) {
  const authz = await authorize("category:write");
  if (!authz.ok) return authz.response;

  const body = await req.json();
  const category = await createCategory(body);
  return Response.json(category, { status: 201 });
}
