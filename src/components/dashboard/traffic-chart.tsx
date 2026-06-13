'use client'

import { Bar, BarChart, XAxis } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { trafficData } from '@/app/admin/dashboard/data'

const config = {
  visitors: { label: 'Visitors', color: 'var(--color-chart-5)' },
} satisfies ChartConfig

export function TrafficChart() {
  return (
    <ChartContainer config={config} className="h-[160px] w-full">
      <BarChart data={trafficData} margin={{ top: 4 }}>
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
        <Bar dataKey="visitors" fill="var(--color-visitors)" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ChartContainer>
  )
}
