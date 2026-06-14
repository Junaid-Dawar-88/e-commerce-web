import { authorize } from "@/lib/rbac";
import { deleteReview, updateReview } from "@/services/review/review";
import { logAudit } from "@/services/audit/audit";

// Next.js 16: `params` is a promise and must be awaited.
// Review `id` is a cuid string, so it is used as-is.
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authz = await authorize("reviews:update");
  if (!authz.ok) return authz.response;

  const { id } = await params;
  const body = await req.json();
  const review = await updateReview(id, body);
  const { name, email, role } = authz.user;
  await logAudit({
    action: body.status ? `Set review ${body.status}` : "Updated review",
    category: "review",
    target: review.productName || review.customerName || id,
    actor: { name, email, role },
  });
  return Response.json(review);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authz = await authorize("reviews:delete");
  if (!authz.ok) return authz.response;

  const { id } = await params;
  const review = await deleteReview(id);
  const { name, email, role } = authz.user;
  await logAudit({
    action: "Deleted review",
    category: "review",
    target: review.productName || review.customerName || id,
    actor: { name, email, role },
  });
  return Response.json(review);
}
