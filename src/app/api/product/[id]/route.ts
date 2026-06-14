import { authorize } from "@/lib/rbac";
import { deleteProduct, updateProduct } from "@/services/product/product";
import { logAudit } from "@/services/audit/audit";

// Next.js 16: `params` is a promise and must be awaited.
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authz = await authorize("products:update");
  if (!authz.ok) return authz.response;

  const { id } = await params;
  const productId = Number(id);

  if (Number.isNaN(productId)) {
    return Response.json({ error: "Invalid product id" }, { status: 400 });
  }

  const body = await req.json();
  const product = await updateProduct(productId, body);
  const { name, email, role } = authz.user;
  await logAudit({
    action: "Updated product",
    category: "product",
    target: product.name,
    actor: { name, email, role },
  });
  return Response.json(product);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authz = await authorize("products:delete");
  if (!authz.ok) return authz.response;

  const { id } = await params;
  const productId = Number(id);

  if (Number.isNaN(productId)) {
    return Response.json({ error: "Invalid product id" }, { status: 400 });
  }

  const product = await deleteProduct(productId);
  const { name, email, role } = authz.user;
  await logAudit({
    action: "Deleted product",
    category: "product",
    target: product.name,
    actor: { name, email, role },
  });
  return Response.json(product);
}
