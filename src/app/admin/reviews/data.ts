// Review view-model types. Real data should come from the database.

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

export const reviews: Review[] = []
