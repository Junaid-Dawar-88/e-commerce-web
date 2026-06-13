'use client'

import { useMemo, useState } from 'react'
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from 'recharts'
import {
  DollarSign,
  ShoppingBag,
  Users,
  Receipt,
  Download,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { StatCard } from '@/components/dashboard/stat-card'
import { reports, periodMeta, type Period } from '@/app/admin/report/data'

const trendConfig = {
  revenue: { label: 'Revenue', color: 'var(--color-chart-1)' },
  orders: { label: 'Orders', color: 'var(--color-chart-2)' },
} satisfies ChartConfig

const channelConfig = {
  value: { label: 'Revenue' },
  Direct: { label: 'Direct', color: 'var(--color-chart-1)' },
  Organic: { label: 'Organic', color: 'var(--color-chart-2)' },
  Referral: { label: 'Referral', color: 'var(--color-chart-3)' },
  Social: { label: 'Social', color: 'var(--color-chart-4)' },
  Email: { label: 'Email', color: 'var(--color-chart-5)' },
} satisfies ChartConfig

const usd = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

export function ReportView() {
  const [period, setPeriod] = useState<Period>('monthly')
  const data = reports[period]
  const meta = periodMeta[period]

  const totalChannel = useMemo(
    () => data.channels.reduce((sum, c) => sum + c.value, 0),
    [data]
  )

  function exportCsv() {
    const header = ['Period', 'Revenue', 'Orders', 'AOV', 'Visitors', 'Refunds']
    const rows = data.series.map((p) => [
      p.label,
      p.revenue,
      p.orders,
      (p.revenue / p.orders).toFixed(2),
      p.visitors,
      p.refunds,
    ])
    const csv = [header, ...rows].map((r) => r.join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `report-${period}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <TabsList>
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{meta.range}</span>
          <Button variant="outline" size="sm" onClick={exportCsv}>
            <Download className="size-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Revenue"
          value={usd(data.summary.revenue)}
          delta={data.summary.revenueDelta}
          icon={DollarSign}
          accent="oklch(0.55 0.22 264)"
        />
        <StatCard
          label="Orders"
          value={data.summary.orders.toLocaleString()}
          delta={data.summary.ordersDelta}
          icon={ShoppingBag}
          accent="oklch(0.7 0.14 195)"
        />
        <StatCard
          label="New Customers"
          value={data.summary.customers.toLocaleString()}
          delta={data.summary.customersDelta}
          icon={Users}
          accent="oklch(0.77 0.16 70)"
        />
        <StatCard
          label="Avg. Order Value"
          value={usd(data.summary.aov)}
          delta={data.summary.aovDelta}
          icon={Receipt}
          accent="oklch(0.72 0.16 158)"
        />
      </div>

      {/* Trend + channels */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="border-b">
            <CardTitle>Revenue vs Orders</CardTitle>
            <CardDescription>
              {meta.label} breakdown · refund rate {data.summary.refundRate}%
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={trendConfig} className="h-[300px] w-full">
              <ComposedChart data={data.series} margin={{ left: 4, right: 8, top: 8 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={10} className="text-xs" />
                <YAxis
                  yAxisId="left"
                  tickLine={false}
                  axisLine={false}
                  width={46}
                  className="text-xs"
                  tickFormatter={(v) => `$${v / 1000}k`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  width={36}
                  className="text-xs"
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  yAxisId="left"
                  dataKey="revenue"
                  fill="var(--color-revenue)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={48}
                />
                <Line
                  yAxisId="right"
                  dataKey="orders"
                  type="monotone"
                  stroke="var(--color-orders)"
                  strokeWidth={2.5}
                  dot={false}
                />
              </ComposedChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <CardTitle>Revenue by Channel</CardTitle>
            <CardDescription>Where sales came from</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={channelConfig} className="mx-auto h-[300px] w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
                <Pie
                  data={data.channels}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={58}
                  outerRadius={92}
                  paddingAngle={2}
                  strokeWidth={2}
                />
                <ChartLegend
                  content={<ChartLegendContent nameKey="name" />}
                  className="flex-wrap gap-x-4"
                />
              </PieChart>
            </ChartContainer>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Total <span className="font-medium text-foreground">{usd(totalChannel)}</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed breakdown */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Detailed Breakdown</CardTitle>
          <CardDescription>Per-{meta.unit} figures for the selected range</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Period</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Orders</TableHead>
                <TableHead className="text-right">AOV</TableHead>
                <TableHead className="text-right">Visitors</TableHead>
                <TableHead className="text-right">Conv.</TableHead>
                <TableHead className="pr-6 text-right">Refunds</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.series.map((p) => (
                <TableRow key={p.label}>
                  <TableCell className="pl-6 font-medium">{p.label}</TableCell>
                  <TableCell className="text-right tabular-nums">{usd(p.revenue)}</TableCell>
                  <TableCell className="text-right tabular-nums">{p.orders}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {usd(p.revenue / p.orders)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {p.visitors.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {((p.orders / p.visitors) * 100).toFixed(1)}%
                  </TableCell>
                  <TableCell className="pr-6 text-right tabular-nums">{p.refunds}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell className="pl-6">Total</TableCell>
                <TableCell className="text-right tabular-nums">
                  {usd(data.series.reduce((s, p) => s + p.revenue, 0))}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {data.series.reduce((s, p) => s + p.orders, 0)}
                </TableCell>
                <TableCell />
                <TableCell className="text-right tabular-nums">
                  {data.series.reduce((s, p) => s + p.visitors, 0).toLocaleString()}
                </TableCell>
                <TableCell />
                <TableCell className="pr-6 text-right tabular-nums">
                  {data.series.reduce((s, p) => s + p.refunds, 0)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
