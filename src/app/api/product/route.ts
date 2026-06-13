import { authorize } from "@/lib/rbac";
import { createProduct, getProducts } from "@/services/product/product";

// Public: anyone can browse products.
export async function GET() {
  const products = await getProducts();
  return Response.json(products);
}

export async function POST(req: Request) {
  const authz = await authorize("product:write");
  if (!authz.ok) return authz.response;

  const body = await req.json();
  const product = await createProduct(body);
  return Response.json(product, { status: 201 });
}
