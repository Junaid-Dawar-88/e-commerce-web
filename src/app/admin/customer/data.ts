// Customer view-model types. Real data should come from the database.

import type { OrderStatus, PaymentStatus } from '@/app/admin/order/data'

export type CustomerStatus = 'active' | 'vip' | 'blocked' | 'inactive'

export type Customer = {
  id: string
  name: string
  email: string
  phone: string
  status: CustomerStatus
  joined: string // short, e.g. "Jan 25"
  joinedLong: string // e.g. "12 Jan 2025"
  daysAgo: number
  orders: number
  completed: number
  pending: number
  cancelled: number
  totalSpent: number
  wishlist: number
  reviews: number
  avgRating: number
  city: string
  state: string
  country: string
}

export const customers: Customer[] = []

// Shape of a row returned by the API (mirrors the Prisma Customer).
export type CustomerRow = {
  id: string
  name: string
  email: string
  phone: string
  status: CustomerStatus
  city: string
  state: string
  country: string
  createdAt: Date | string
}

const MS_PER_DAY = 1000 * 60 * 60 * 24

// Map an API row to the view-model. Aggregate stats (orders, spend, reviews)
// default to 0 until the related tables exist.
export function mapCustomer(row: CustomerRow): Customer {
  const joined = new Date(row.createdAt)
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    status: row.status,
    joined: joined.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    joinedLong: joined.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    daysAgo: Math.max(0, Math.floor((Date.now() - joined.getTime()) / MS_PER_DAY)),
    orders: 0,
    completed: 0,
    pending: 0,
    cancelled: 0,
    totalSpent: 0,
    wishlist: 0,
    reviews: 0,
    avgRating: 0,
    city: row.city,
    state: row.state,
    country: row.country,
  }
}

// One of the customer's orders, summarised for the detail page's order list.
export type CustomerOrder = {
  id: string
  ref: string
  date: string
  amount: number
  items: number
  status: OrderStatus
  paymentStatus: PaymentStatus
}

// Customer row with the orders relation (and item counts) for the detail page.
export type CustomerDetailRow = CustomerRow & {
  orders: {
    id: string
    amount: string
    status: OrderStatus
    paymentStatus: PaymentStatus
    createdAt: Date | string
    items: { id: string }[]
  }[]
}

// Build the full detail view-model: real order stats + the order list, plus
// the customer's review count / average rating.
export function mapCustomerDetail(
  row: CustomerDetailRow,
  reviews: { rating: number }[]
): { customer: Customer; orders: CustomerOrder[] } {
  const orders: CustomerOrder[] = row.orders.map((o) => {
    const created = new Date(o.createdAt)
    return {
      id: o.id,
      ref: `#${o.id.slice(-8).toUpperCase()}`,
      date: created.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      amount: Number(o.amount) || 0,
      items: o.items.length,
      status: o.status,
      paymentStatus: o.paymentStatus,
    }
  })

  const completed = row.orders.filter((o) => o.status === 'delivered').length
  const cancelled = row.orders.filter((o) => o.status === 'cancelled').length
  const pending = row.orders.length - completed - cancelled
  const totalSpent = row.orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (Number(o.amount) || 0), 0)
  const avgRating = reviews.length
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
    : 0

  return {
    customer: {
      ...mapCustomer(row),
      orders: row.orders.length,
      completed,
      pending,
      cancelled,
      totalSpent,
      reviews: reviews.length,
      avgRating,
    },
    orders,
  }
}
