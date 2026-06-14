import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import { ReviewDetail } from '@/components/review/review-detail'
import { mapReview } from '@/app/admin/reviews/data'

export default async function ReviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const row = await prisma.review.findUnique({ where: { id } })

  if (!row) {
    notFound()
  }

  return <ReviewDetail review={mapReview(row)} />
}
