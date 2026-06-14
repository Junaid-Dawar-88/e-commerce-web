// Report view-model types. The live data is aggregated from the Orders and
// Customers tables — see `src/services/report/report.ts`.

export type Period = 'daily' | 'weekly' | 'monthly'

export type SeriesPoint = {
  label: string
  revenue: number
  orders: number
  refunds: number
}

// One slice of the "Revenue by Seller" donut.
export type ChannelSlice = {
  name: string
  value: number
  fill: string
}

export type ReportSummary = {
  revenue: number
  orders: number
  customers: number
  aov: number
  refundRate: number
  revenueDelta: number
  ordersDelta: number
  customersDelta: number
  aovDelta: number
}

export type ReportData = {
  summary: ReportSummary
  series: SeriesPoint[]
  channels: ChannelSlice[]
}

export type Reports = Record<Period, ReportData>

export const periodMeta: Record<Period, { label: string; unit: string; range: string }> = {
  daily: { label: 'Daily', unit: 'day', range: 'Last 7 days' },
  weekly: { label: 'Weekly', unit: 'week', range: 'Last 7 weeks' },
  monthly: { label: 'Monthly', unit: 'month', range: 'Year to date' },
}
