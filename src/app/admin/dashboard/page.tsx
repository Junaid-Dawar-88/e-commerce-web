import {
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { StatCard } from '@/components/dashboard/stat-card'
import { RevenueChart } from '@/components/dashboard/revenue-chart'
import { CategoryChart } from '@/components/dashboard/category-chart'
import { TrafficChart } from '@/components/dashboard/traffic-chart'
import { cn } from '@/lib/utils'
import { recentOrders, topProducts, type OrderStatus } from './data'

const stats: {
  label: string
  value: string
  delta: number
  icon: typeof DollarSign
  accent: string
}[] = []

const statusStyles: Record<OrderStatus, string> = {
  paid: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  refunded: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
}

const currency = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back — here&apos;s what&apos;s happening in your store today.
          </p>
        </div>
        <Badge variant="outline" className="gap-1.5 py-1.5">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          Live · Jan 1 – Dec 31, 2026
        </Badge>
      </header>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="border-b">
            <CardTitle>Revenue & Orders</CardTitle>
            <CardDescription>Monthly performance across the year</CardDescription>
            <CardAction>
              <Badge variant="secondary" className="gap-1 text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight className="size-3" /> 18.2%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardContent>
            <RevenueChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <CardTitle>Sales by Category</CardTitle>
            <CardDescription>Units sold this month</CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryChart />
          </CardContent>
        </Card>
      </div>

      {/* Bottom row: recent orders + side column */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="border-b">
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest transactions from your store</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="pr-6 text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="pl-6 font-medium tabular-nums">{o.id}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{o.customer}</span>
                        <span className="text-xs text-muted-foreground">{o.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn('capitalize', statusStyles[o.status])}>
                        {o.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{currency(o.amount)}</TableCell>
                    <TableCell className="pr-6 text-right text-muted-foreground">{o.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Weekly Traffic</CardTitle>
              <CardDescription>Visitors over the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <TrafficChart />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle>Top Products</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {topProducts.map((p, i) => {
                const up = p.trend >= 0
                return (
                  <div key={p.name} className="flex items-center gap-3">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground tabular-nums">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground tabular-nums">
                        {p.sold.toLocaleString()} sold
                      </p>
                    </div>
                    <span
                      className={cn(
                        'flex items-center gap-0.5 text-xs font-medium tabular-nums',
                        up ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      )}
                    >
                      {up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                      {Math.abs(p.trend)}%
                    </span>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
