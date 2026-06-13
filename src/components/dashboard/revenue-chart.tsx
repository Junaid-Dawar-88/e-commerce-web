'use client'

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { revenueData } from '@/app/admin/dashboard/data'

const config = {
  revenue: { label: 'Revenue', color: 'var(--color-chart-1)' },
  orders: { label: 'Orders', color: 'var(--color-chart-2)' },
} satisfies ChartConfig

export function RevenueChart() {
  return (
    <ChartContainer config={config} className="h-[280px] w-full">
      <AreaChart data={revenueData} margin={{ left: 4, right: 12, top: 8 }}>
        <defs>
          <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.4} />
            <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="fillOrders" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-orders)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="var(--color-orders)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          className="text-xs"
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          width={44}
          className="text-xs"
          tickFormatter={(v) => `$${v / 1000}k`}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="line" />}
        />
        <Area
          dataKey="orders"
          type="natural"
          fill="url(#fillOrders)"
          stroke="var(--color-orders)"
          strokeWidth={2}
          stackId="a"
        />
        <Area
          dataKey="revenue"
          type="natural"
          fill="url(#fillRevenue)"
          stroke="var(--color-revenue)"
          strokeWidth={2}
          stackId="b"
        />
      </AreaChart>
    </ChartContainer>
  )
}
