// Dashboard view-model types. The live data is aggregated from the same
// database tables that power the Orders / Products / Customers pages — see
// `src/services/dashboard/dashboard.ts`.

// Recent-orders badge state, derived from an order's payment status.
export type OrderStatus = 'paid' | 'pending' | 'refunded'

// A single KPI: its current value plus the % change vs. the previous month.
export type Metric = { value: number; delta: number }

export type RevenuePoint = { month: string; revenue: number; orders: number }
export type CategoryPoint = { category: string; sales: number; fill: string }
export type OrdersByDayPoint = { day: string; orders: number }

export type RecentOrder = {
  id: string
  customer: string
  email: string
  amount: number
  status: OrderStatus
  date: string
}

export type TopProduct = {
  name: string
  sold: number
  revenue: number
  trend: number
}

export type DashboardData = {
  metrics: {
    revenue: Metric
    orders: Metric
    customers: Metric
    avgOrder: Metric
  }
  revenueSeries: RevenuePoint[]
  categorySeries: CategoryPoint[]
  ordersByDay: OrdersByDayPoint[]
  recentOrders: RecentOrder[]
  topProducts: TopProduct[]
}

// Palette used to colour the "Sales by Category" bars.
export const CHART_FILLS = [
  'var(--color-chart-1)',
  'var(--color-chart-2)',
  'var(--color-chart-3)',
  'var(--color-chart-4)',
  'var(--color-chart-5)',
]
