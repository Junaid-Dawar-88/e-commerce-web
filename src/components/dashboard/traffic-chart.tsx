'use client'

import { Bar, BarChart, XAxis } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import type { OrdersByDayPoint } from '@/app/admin/dashboard/data'

const config = {
  orders: { label: 'Orders', color: 'var(--color-chart-5)' },
} satisfies ChartConfig

export function WeeklyOrdersChart({ data }: { data: OrdersByDayPoint[] }) {
  return (
    <ChartContainer config={config} className="h-[160px] w-full">
      <BarChart data={data} margin={{ top: 4 }}>
        <XAxis
          dataKey="day"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          className="text-xs"
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Bar dataKey="orders" fill="var(--color-orders)" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ChartContainer>
  )
}
