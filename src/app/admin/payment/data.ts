// Payment view-model types. A payment is an order's transaction, so the live
// data is derived from the Orders table — see `mapPayment` below.

import type { OrderRow } from '@/app/admin/order/data'

export type PaymentStatus = 'paid' | 'pending' | 'failed' | 'refunded'
// Common named gateways (kept for reference; the live method is whatever the
// order recorded).
export type PaymentMethod = 'Stripe' | 'PayPal' | 'Easypaisa' | 'JazzCash'

export type Payment = {
  id: string
  orderId: string
  customer: string
  email: string
  amount: number
  method: string
  status: PaymentStatus
  date: string
  dateLong: string
  daysAgo: number
  billingAddress: string
  platformFee: number
  sellerEarnings: number
}

// The storefront takes a 10% cut (matches the Payout Breakdown on the detail
// page). Adjust here if the commission changes.
const PLATFORM_FEE_RATE = 0.1

// An order's payment status maps onto the gateway-style statuses this view uses.
function mapStatus(paymentStatus: string): PaymentStatus {
  if (paymentStatus === 'paid') return 'paid'
  if (paymentStatus === 'refunded') return 'refunded'
  return 'pending' // cod / unpaid haven't settled yet
}

// Map an order row (GET /api/order) into a payment transaction view-model.
export function mapPayment(row: OrderRow): Payment {
  const created = new Date(row.createdAt)
  const amount = Number(row.amount) || 0
  const platformFee = Math.round(amount * PLATFORM_FEE_RATE * 100) / 100
  const daysAgo = Math.max(0, Math.floor((Date.now() - created.getTime()) / 86_400_000))

  return {
    id: row.id,
    orderId: `#${row.id.slice(-8).toUpperCase()}`,
    customer: row.customer?.name ?? 'Customer',
    email: row.customer?.email ?? '',
    amount,
    method: row.paymentMethod?.trim() || (row.paymentStatus === 'cod' ? 'Cash on Delivery' : 'Other'),
    status: mapStatus(row.paymentStatus),
    date: created.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    dateLong: created.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    daysAgo,
    billingAddress: row.shippingAddress || '—',
    platformFee,
    sellerEarnings: Math.round((amount - platformFee) * 100) / 100,
  }
}
