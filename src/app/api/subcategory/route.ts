import { authorize } from "@/lib/rbac";
import {
  createSubcategory,
  getSubcategories,
} from "@/services/category/subcategory";

// Public: anyone can browse the catalog.
export async function GET() {
  const subcategories = await getSubcategories();
  return Response.json(subcategories);
}

export async function POST(req: Request) {
  const authz = await authorize("categories:create");
  if (!authz.ok) return authz.response;

  const body = await req.json();
  const subcategory = await createSubcategory(body);
  return Response.json(subcategory, { status: 201 });
}
