// Payment view-model types. Real data should come from the database/gateway.

export type PaymentStatus = 'paid' | 'pending' | 'failed' | 'refunded'
export type PaymentMethod = 'Stripe' | 'PayPal' | 'Easypaisa' | 'JazzCash'

export type Payment = {
  id: string
  orderId: string
  customer: string
  email: string
  amount: number
  method: PaymentMethod
  status: PaymentStatus
  date: string
  dateLong: string
  daysAgo: number
  billingAddress: string
  platformFee: number
  sellerEarnings: number
}

export const payments: Payment[] = []

export const revenueSeries: { label: string; revenue: number }[] = []
