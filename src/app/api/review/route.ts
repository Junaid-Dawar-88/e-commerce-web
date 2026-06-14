import { authorize } from "@/lib/rbac";
import { createReview, getReviews } from "@/services/review/review";

export async function GET() {
  const authz = await authorize("reviews:view");
  if (!authz.ok) return authz.response;

  const reviews = await getReviews();
  return Response.json(reviews);
}

export async function POST(req: Request) {
  const authz = await authorize("reviews:create");
  if (!authz.ok) return authz.response;

  const body = await req.json();
  const review = await createReview(body);
  return Response.json(review, { status: 201 });
}
