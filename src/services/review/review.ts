import prisma from "@/lib/prisma";
import { ReviewInput, ReviewUpdateInput } from "@/types/review";

export async function getReviews() {
  return prisma.review.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function createReview(input: ReviewInput) {
  return prisma.review.create({
    data: {
      productId: input.productId ?? null,
      productName: input.productName,
      customerId: input.customerId ?? null,
      customerName: input.customerName,
      rating: input.rating,
      comment: input.comment ?? "",
      status: input.status ?? "pending",
    },
  });
}

export async function updateReview(id: string, input: ReviewUpdateInput) {
  return prisma.review.update({
    where: { id },
    data: {
      status: input.status,
      comment: input.comment,
      rating: input.rating,
    },
  });
}

export async function deleteReview(id: string) {
  return prisma.review.delete({
    where: { id },
  });
}
