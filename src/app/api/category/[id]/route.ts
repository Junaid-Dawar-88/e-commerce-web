import { authorize } from "@/lib/rbac";
import { deleteCategory, updateCategory } from "@/services/category/category";

// Next.js 16: `params` is a promise and must be awaited.
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authz = await authorize("category:write");
  if (!authz.ok) return authz.response;

  const { id } = await params;
  const categoryId = Number(id);

  if (Number.isNaN(categoryId)) {
    return Response.json({ error: "Invalid category id" }, { status: 400 });
  }

  const body = await req.json();
  const category = await updateCategory(categoryId, body);
  return Response.json(category);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authz = await authorize("category:write");
  if (!authz.ok) return authz.response;

  const { id } = await params;
  const categoryId = Number(id);

  if (Number.isNaN(categoryId)) {
    return Response.json({ error: "Invalid category id" }, { status: 400 });
  }

  const category = await deleteCategory(categoryId);
  return Response.json(category);
}
