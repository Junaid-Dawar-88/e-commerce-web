'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  Download,
  Eye,
  Pencil,
  MoreHorizontal,
  Trash2,
  ShoppingCart,
  Clock,
  PackageCheck,
  DollarSign,
  FileText,
  RotateCcw,
  ChevronDown,
  type LucideIcon,
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useMoney } from '@/components/store-provider'
import { InvoiceDialog } from '@/components/order/invoice-dialog'
import {
  mapOrder,
  type Order,
  type OrderRow,
  type OrderStatus,
  type PaymentStatus,
} from '@/app/admin/order/data'
import {
  deleteOrder,
  getOrders,
  updateOrder,
} from '@/app/api/order-helper/order-helper'

const orderStatusList: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

const statusMeta: Record<OrderStatus, { label: string; badge: string; bar: string }> = {
  pending: { label: 'Pending', badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', bar: 'bg-amber-400' },
  processing: { label: 'Processing', badge: 'bg-sky-500/10 text-sky-600 dark:text-sky-400', bar: 'bg-sky-500' },
  shipped: { label: 'Shipped', badge: 'bg-violet-500/10 text-violet-600 dark:text-violet-400', bar: 'bg-violet-500' },
  delivered: { label: 'Delivered', badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', bar: 'bg-emerald-500' },
  cancelled: { label: 'Cancelled', badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400', bar: 'bg-rose-500' },
}

const paymentMeta: Record<PaymentStatus, { label: string; badge: string }> = {
  paid: { label: 'Paid', badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  cod: { label: 'COD', badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  unpaid: { label: 'Unpaid', badge: 'bg-muted text-muted-foreground' },
  refunded: { label: 'Refunded', badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' },
}

function StatTile({ label, value, icon: Icon, accent }: { label: string; value: string; icon: LucideIcon; accent: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
      <span
        className="flex size-11 items-center justify-center rounded-lg"
        style={{ background: `color-mix(in oklch, ${accent} 14%, transparent)`, color: accent }}
      >
        <Icon className="size-5" />
      </span>
      <div className="leading-tight">
        <p className="text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

export function OrdersView() {
  const router = useRouter()
  const usd = useMoney()
  const [items, setItems] = useState<Order[]>([])
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<OrderStatus | 'all'>('all')
  const [payment, setPayment] = useState<PaymentStatus | 'all'>('all')
  const [seller, setSeller] = useState('all')
  const [dateRange, setDateRange] = useState('all')
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null)

  // Open an order's full details on its own page.
  const openOrder = (id: string) => router.push(`/admin/order/${id}`)

  // Load real orders from the database on mount.
  useEffect(() => {
    getOrders()
      .then((rows: OrderRow[]) => setItems(rows.map(mapOrder)))
      .catch(() => {
        // Leave the table empty if the API is unavailable.
      })
  }, [])

  const sellerOptions = useMemo(
    () => Array.from(new Set(items.map((o) => o.seller))).sort(),
    [items]
  )

  const stats = useMemo(() => {
    const total = items.length
    const pending = items.filter((o) => o.status === 'pending').length
    const delivered = items.filter((o) => o.status === 'delivered').length
    const revenue = items.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.amount, 0)
    return { total, pending, delivered, revenue }
  }, [items])

  const overview = useMemo(() => {
    const total = items.length || 1
    return orderStatusList.map((s) => {
      const count = items.filter((o) => o.status === s).length
      return { status: s, count, percent: Math.round((count / total) * 100) }
    })
  }, [items])

  const maxCount = Math.max(1, ...overview.map((o) => o.count))

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((o) => {
      const matchesQuery =
        !q || o.id.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q) || o.email.toLowerCase().includes(q)
      const matchesStatus = status === 'all' || o.status === status
      const matchesPayment = payment === 'all' || o.paymentStatus === payment
      const matchesSeller = seller === 'all' || o.seller === seller
      const matchesDate = dateRange === 'all' || o.daysAgo <= Number(dateRange)
      return matchesQuery && matchesStatus && matchesPayment && matchesSeller && matchesDate
    })
  }, [items, query, status, payment, seller, dateRange])

  const setOrderStatus = (id: string, next: OrderStatus) => {
    // Optimistic update, then persist to the database.
    setItems((prev) => prev.map((o) => (o.id === id ? { ...o, status: next } : o)))
    updateOrder(id, { status: next }).catch(() => {
      // Reload from the server if the update failed.
      getOrders().then((rows: OrderRow[]) => setItems(rows.map(mapOrder))).catch(() => {})
    })
  }

  const refundOrder = (id: string) => {
    setItems((prev) =>
      prev.map((o) => (o.id === id ? { ...o, paymentStatus: 'refunded', status: 'cancelled' } : o))
    )
    updateOrder(id, { paymentStatus: 'refunded', status: 'cancelled' }).catch(() => {
      getOrders().then((rows: OrderRow[]) => setItems(rows.map(mapOrder))).catch(() => {})
    })
  }

  const removeOrder = (id: string) => {
    setItems((prev) => prev.filter((o) => o.id !== id))
    deleteOrder(id).catch(() => {
      getOrders().then((rows: OrderRow[]) => setItems(rows.map(mapOrder))).catch(() => {})
    })
  }

  function exportCsv() {
    const header = ['Order ID', 'Customer', 'Email', 'Amount', 'Payment', 'Status', 'Date']
    const rows = filtered.map((o) => [o.id, o.customer, o.email, o.amount, o.paymentStatus, o.status, o.date])
    const csv = [header, ...rows].map((r) => r.join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'orders.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Orders Management</h1>
          <p className="text-sm text-muted-foreground">Track, fulfill, and refund customer orders.</p>
        </div>
        <Button variant="outline" onClick={exportCsv}>
          <Download className="size-4" />
          Export
        </Button>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Total Orders" value={stats.total.toLocaleString()} icon={ShoppingCart} accent="oklch(0.55 0.22 264)" />
        <StatTile label="Pending Orders" value={stats.pending.toLocaleString()} icon={Clock} accent="oklch(0.77 0.16 70)" />
        <StatTile label="Delivered" value={stats.delivered.toLocaleString()} icon={PackageCheck} accent="oklch(0.72 0.16 158)" />
        <StatTile label="Total Revenue" value={usd(stats.revenue)} icon={DollarSign} accent="oklch(0.7 0.14 195)" />
      </div>

      {/* Status overview */}
      <div className="rounded-xl bg-card p-5 ring-1 ring-foreground/10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-medium">Order Status Overview</h2>
          <span className="text-xs text-muted-foreground">Last 30 days</span>
        </div>
        <div className="flex flex-col gap-2.5">
          {overview.map((o) => (
            <div key={o.status} className="flex items-center gap-3">
              <span className="w-24 shrink-0 text-sm">{statusMeta[o.status].label}</span>
              <div className="flex flex-1 items-center gap-2">
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn('h-full rounded-full transition-all', statusMeta[o.status].bar)}
                    style={{ width: `${(o.count / maxCount) * 100}%` }}
                  />
                </div>
                <span className="w-8 shrink-0 text-sm tabular-nums">{o.count}</span>
              </div>
              <span className="w-10 shrink-0 text-right text-sm tabular-nums text-muted-foreground">{o.percent}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
        <div className="relative min-w-50 flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search order…" value={query} onChange={(e) => setQuery(e.target.value)} className="h-9 pl-8" />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as OrderStatus | 'all')}>
          <SelectTrigger size="sm" className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {orderStatusList.map((s) => (
              <SelectItem key={s} value={s}>{statusMeta[s].label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={payment} onValueChange={(v) => setPayment(v as PaymentStatus | 'all')}>
          <SelectTrigger size="sm" className="w-36"><SelectValue placeholder="Payment" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All payments</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="cod">COD</SelectItem>
            <SelectItem value="unpaid">Unpaid</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
        <Select value={seller} onValueChange={setSeller}>
          <SelectTrigger size="sm" className="w-40"><SelectValue placeholder="Seller" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sellers</SelectItem>
            {sellerOptions.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
          </SelectContent>
        </Select>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger size="sm" className="w-36"><SelectValue placeholder="Date" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All time</SelectItem>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders table */}
      <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-12 pr-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((o) => (
                <TableRow
                  key={o.id}
                  onClick={() => openOrder(o.id)}
                  className="cursor-pointer hover:bg-accent/40"
                >
                  <TableCell className="pl-4 font-medium tabular-nums">{o.id}</TableCell>
                  <TableCell>{o.customer}</TableCell>
                  <TableCell className="text-right tabular-nums">{usd(o.amount)}</TableCell>
                  <TableCell>
                    <Badge className={cn('font-normal', paymentMeta[o.paymentStatus].badge)}>
                      {paymentMeta[o.paymentStatus].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn('font-normal', statusMeta[o.status].badge)}>
                      {statusMeta[o.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{o.date}</TableCell>
                  <TableCell className="pr-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8" aria-label="Actions">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => openOrder(o.id)}>
                            <Eye className="size-4" /> View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openOrder(o.id)}>
                            <Pencil className="size-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>Update status</DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                              {orderStatusList.map((s) => (
                                <DropdownMenuItem key={s} onClick={() => setOrderStatus(o.id, s)}>
                                  <span className={cn('size-2 rounded-full', statusMeta[s].bar)} />
                                  {statusMeta[s].label}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>
                          <DropdownMenuItem onClick={() => setInvoiceOrder(o)}>
                            <FileText className="size-4" /> Generate invoice
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => refundOrder(o.id)}>
                            <RotateCcw className="size-4" /> Refund order
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" onClick={() => removeOrder(o.id)}>
                            <Trash2 className="size-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">No orders found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
      </div>

      <InvoiceDialog order={invoiceOrder} onOpenChange={(open) => !open && setInvoiceOrder(null)} />
    </div>
  )
}
