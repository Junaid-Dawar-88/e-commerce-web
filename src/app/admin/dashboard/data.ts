// Dashboard view-model types. Real data should come from the database/API.

export const revenueData: { month: string; revenue: number; orders: number }[] = []

export const categoryData: { category: string; sales: number; fill: string }[] = []

export const trafficData: { day: string; visitors: number }[] = []

export type OrderStatus = 'paid' | 'pending' | 'refunded'

export const recentOrders: {
  id: string
  customer: string
  email: string
  amount: number
  status: OrderStatus
  date: string
}[] = []

export const topProducts: {
  name: string
  sold: number
  revenue: number
  trend: number
}[] = []
