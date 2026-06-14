import { ReviewInput, ReviewUpdateInput } from "@/types/review";

const reviewApi = "/api/review";

export async function getReviews() {
  const res = await fetch(reviewApi);
  if (!res.ok) {
    throw new Error("Failed to fetch reviews");
  }
  return await res.json();
}

export async function addReview(review: ReviewInput) {
  const res = await fetch(reviewApi, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(review),
  });
  if (!res.ok) {
    throw new Error("Failed to add review");
  }
  return await res.json();
}

export async function updateReview(id: string, data: ReviewUpdateInput) {
  const res = await fetch(`${reviewApi}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error("Failed to update review");
  }
  return await res.json();
}

export async function deleteReview(id: string) {
  const res = await fetch(`${reviewApi}/${id}`, { method: "DELETE" });
  if (!res.ok) {
    throw new Error("Failed to delete review");
  }
  return await res.json();
}
