'use client'

import { Bar, BarChart, XAxis, YAxis } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { categoryData } from '@/app/admin/dashboard/data'

const config = {
  sales: { label: 'Sales' },
} satisfies ChartConfig

export function CategoryChart() {
  return (
    <ChartContainer config={config} className="h-[280px] w-full">
      <BarChart
        data={categoryData}
        layout="vertical"
        margin={{ left: 8, right: 16 }}
      >
        <XAxis type="number" dataKey="sales" hide />
        <YAxis
          type="category"
          dataKey="category"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          width={84}
          className="text-xs"
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Bar dataKey="sales" radius={6} barSize={28} />
      </BarChart>
    </ChartContainer>
  )
}
