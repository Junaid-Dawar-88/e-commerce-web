// Review view-model types. The live data comes from the database — see
// `src/services/review/review.ts`.

export type ReviewStatus = 'approved' | 'pending' | 'reported' | 'hidden'

export type Review = {
  id: string
  product: string
  customer: string
  rating: number // 1–5
  comment: string
  date: string
  status: ReviewStatus
}

// Shape returned by GET /api/review (mirrors the Prisma Review).
export type ReviewRow = {
  id: string
  productName: string
  customerName: string
  rating: number
  comment: string
  status: ReviewStatus
  createdAt: Date | string
}

// Map an API review row into the table's view-model.
export function mapReview(row: ReviewRow): Review {
  return {
    id: row.id,
    product: row.productName || '—',
    customer: row.customerName || 'Anonymous',
    rating: row.rating,
    comment: row.comment,
    date: new Date(row.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
    status: row.status,
  }
}
