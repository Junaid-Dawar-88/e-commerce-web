// Order view-model types. Real data should come from the database.

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
export type PaymentStatus = 'paid' | 'cod' | 'unpaid' | 'refunded'

export type LineItem = {
  name: string
  variant: string
  qty: number
  price: number
}

export type Order = {
  id: string
  customer: string
  email: string
  amount: number
  paymentStatus: PaymentStatus
  paymentMethod: string
  status: OrderStatus
  seller: string
  date: string
  daysAgo: number
  shippingAddress: string
  paymentProof: string
  items: LineItem[]
}

export const orders: Order[] = []

// Shape returned by GET /api/order for staff/admin (mirrors the Prisma Order
// with its relations included).
export type OrderItemRow = {
  id: string
  name: string
  variant: string
  qty: number
  price: string
}

export type OrderRow = {
  id: string
  amount: string
  paymentStatus: PaymentStatus
  paymentMethod: string
  status: OrderStatus
  seller: string
  shippingAddress: string
  paymentProof?: string
  createdAt: Date | string
  customer?: { name: string; email: string } | null
  items: OrderItemRow[]
}

// Map an API order row into the table's view-model.
export function mapOrder(row: OrderRow): Order {
  const created = new Date(row.createdAt)
  const daysAgo = Math.max(
    0,
    Math.floor((Date.now() - created.getTime()) / 86_400_000)
  )
  return {
    id: row.id,
    customer: row.customer?.name ?? 'Customer',
    email: row.customer?.email ?? '',
    amount: Number(row.amount) || 0,
    paymentStatus: row.paymentStatus,
    paymentMethod: row.paymentMethod,
    status: row.status,
    seller: row.seller || '—',
    date: created.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
    daysAgo,
    shippingAddress: row.shippingAddress,
    paymentProof: row.paymentProof ?? '',
    items: row.items.map((it) => ({
      name: it.name,
      variant: it.variant,
      qty: it.qty,
      price: Number(it.price) || 0,
    })),
  }
}
