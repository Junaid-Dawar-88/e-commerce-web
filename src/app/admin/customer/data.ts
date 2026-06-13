// Customer view-model types. Real data should come from the database.

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
