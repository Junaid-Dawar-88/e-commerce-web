// Report view-model types. Real data should come from aggregation queries.

export type Period = 'daily' | 'weekly' | 'monthly'

export type SeriesPoint = {
  label: string
  revenue: number
  orders: number
  visitors: number
  refunds: number
}

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

const emptyReport: ReportData = {
  summary: {
    revenue: 0,
    orders: 0,
    customers: 0,
    aov: 0,
    refundRate: 0,
    revenueDelta: 0,
    ordersDelta: 0,
    customersDelta: 0,
    aovDelta: 0,
  },
  series: [],
  channels: [],
}

export const reports: Record<Period, ReportData> = {
  daily: emptyReport,
  weekly: emptyReport,
  monthly: emptyReport,
}

export const periodMeta: Record<Period, { label: string; unit: string; range: string }> = {
  daily: { label: 'Daily', unit: 'day', range: 'Last 7 days' },
  weekly: { label: 'Weekly', unit: 'week', range: 'Last 7 weeks' },
  monthly: { label: 'Monthly', unit: 'month', range: 'Year to date' },
}
