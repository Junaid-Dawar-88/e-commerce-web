import { authorize } from "@/lib/rbac";
import { deleteProduct, updateProduct } from "@/services/product/product";

// Next.js 16: `params` is a promise and must be awaited.
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authz = await authorize("product:write");
  if (!authz.ok) return authz.response;

  const { id } = await params;
  const productId = Number(id);

  if (Number.isNaN(productId)) {
    return Response.json({ error: "Invalid product id" }, { status: 400 });
  }

  const body = await req.json();
  const product = await updateProduct(productId, body);
  return Response.json(product);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authz = await authorize("product:write");
  if (!authz.ok) return authz.response;

  const { id } = await params;
  const productId = Number(id);

  if (Number.isNaN(productId)) {
    return Response.json({ error: "Invalid product id" }, { status: 400 });
  }

  const product = await deleteProduct(productId);
  return Response.json(product);
}
