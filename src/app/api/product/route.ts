import { authorize } from "@/lib/rbac";
import { createProduct, getProducts } from "@/services/product/product";
import { logAudit } from "@/services/audit/audit";

// Public: anyone can browse products.
export async function GET() {
  const products = await getProducts();
  return Response.json(products);
}

export async function POST(req: Request) {
  const authz = await authorize("products:create");
  if (!authz.ok) return authz.response;

  const body = await req.json();
  const product = await createProduct(body);
  const { name, email, role } = authz.user;
  await logAudit({
    action: "Created product",
    category: "product",
    target: product.name,
    actor: { name, email, role },
  });
  return Response.json(product, { status: 201 });
}
