import { authorize } from "@/lib/rbac";
import {
  deleteSubcategory,
  updateSubcategory,
} from "@/services/category/subcategory";

// Next.js 16: `params` is a promise and must be awaited.
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authz = await authorize("categories:update");
  if (!authz.ok) return authz.response;

  const { id } = await params;
  const subcategoryId = Number(id);

  if (Number.isNaN(subcategoryId)) {
    return Response.json({ error: "Invalid subcategory id" }, { status: 400 });
  }

  const body = await req.json();
  const subcategory = await updateSubcategory(subcategoryId, body);
  return Response.json(subcategory);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authz = await authorize("categories:delete");
  if (!authz.ok) return authz.response;

  const { id } = await params;
  const subcategoryId = Number(id);

  if (Number.isNaN(subcategoryId)) {
    return Response.json({ error: "Invalid subcategory id" }, { status: 400 });
  }

  const subcategory = await deleteSubcategory(subcategoryId);
  return Response.json(subcategory);
}
