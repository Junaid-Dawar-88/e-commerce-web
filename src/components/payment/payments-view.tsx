'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  Download,
  Eye,
  MoreHorizontal,
  Trash2,
  DollarSign,
  CheckCircle2,
  Clock,
  Undo2,
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useMoney } from '@/components/store-provider'
import {
  mapPayment,
  type Payment,
  type PaymentStatus,
} from '@/app/admin/payment/data'
import { getOrders } from '@/app/api/order-helper/order-helper'
import type { OrderRow } from '@/app/admin/order/data'

const statusMeta: Record<PaymentStatus, { label: string; badge: string }> = {
  paid: { label: 'Paid', badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  pending: { label: 'Pending', badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  failed: { label: 'Failed', badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' },
  refunded: { label: 'Refunded', badge: 'bg-violet-500/10 text-violet-600 dark:text-violet-400' },
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

export function PaymentsView() {
  const router = useRouter()
  const usd = useMoney()
  const [items, setItems] = useState<Payment[]>([])
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<PaymentStatus | 'all'>('all')
  const [method, setMethod] = useState<string>('all')
  const [dateRange, setDateRange] = useState('all')
  const [amountBand, setAmountBand] = useState('all')

  // Payments are orders — load them and map each into a transaction.
  useEffect(() => {
    getOrders()
      .then((rows: OrderRow[]) => setItems(rows.map(mapPayment)))
      .catch(() => {
        // Leave the table empty if the API is unavailable.
      })
  }, [])

  // Build the method filter from the methods that actually appear in the data.
  const methodOptions = useMemo(
    () => Array.from(new Set(items.map((p) => p.method))).sort(),
    [items]
  )

  const stats = useMemo(() => {
    const revenue = items.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0)
    return {
      revenue,
      successful: items.filter((p) => p.status === 'paid').length,
      pending: items.filter((p) => p.status === 'pending').length,
      refunded: items.filter((p) => p.status === 'refunded').length,
    }
  }, [items])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((p) => {
      const matchesQuery =
        !q || p.id.toLowerCase().includes(q) || p.orderId.toLowerCase().includes(q) || p.customer.toLowerCase().includes(q)
      const matchesStatus = status === 'all' || p.status === status
      const matchesMethod = method === 'all' || p.method === method
      const matchesDate = dateRange === 'all' || p.daysAgo <= Number(dateRange)
      const matchesAmount =
        amountBand === 'all' ||
        (amountBand === 'low' && p.amount < 100) ||
        (amountBand === 'mid' && p.amount >= 100 && p.amount <= 200) ||
        (amountBand === 'high' && p.amount > 200)
      return matchesQuery && matchesStatus && matchesMethod && matchesDate && matchesAmount
    })
  }, [items, query, status, method, dateRange, amountBand])

  const openDetail = (id: string) => router.push(`/admin/payment/${id}`)
  const remove = (id: string) => setItems((prev) => prev.filter((p) => p.id !== id))

  function exportCsv() {
    const header = ['Transaction', 'Order ID', 'Customer', 'Amount', 'Method', 'Status', 'Date']
    const rows = filtered.map((p) => [p.id, p.orderId, p.customer, p.amount, p.method, p.status, p.date])
    const csv = [header, ...rows].map((r) => r.join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'payments.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Payment Management</h1>
          <p className="text-sm text-muted-foreground">Monitor transactions, payouts, and refunds.</p>
        </div>
        <Button variant="outline" onClick={exportCsv}>
          <Download className="size-4" /> Export
        </Button>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Total Revenue" value={usd(stats.revenue)} icon={DollarSign} accent="oklch(0.55 0.22 264)" />
        <StatTile label="Successful" value={stats.successful.toLocaleString()} icon={CheckCircle2} accent="oklch(0.72 0.16 158)" />
        <StatTile label="Pending" value={stats.pending.toLocaleString()} icon={Clock} accent="oklch(0.77 0.16 70)" />
        <StatTile label="Refunded" value={stats.refunded.toLocaleString()} icon={Undo2} accent="oklch(0.65 0.22 16)" />
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
        <div className="relative min-w-50 flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search transaction…" value={query} onChange={(e) => setQuery(e.target.value)} className="h-9 pl-8" />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as PaymentStatus | 'all')}>
          <SelectTrigger size="sm" className="w-32"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
        <Select value={method} onValueChange={setMethod}>
          <SelectTrigger size="sm" className="w-36"><SelectValue placeholder="Method" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All methods</SelectItem>
            {methodOptions.map((m) => (<SelectItem key={m} value={m}>{m}</SelectItem>))}
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
        <Select value={amountBand} onValueChange={setAmountBand}>
          <SelectTrigger size="sm" className="w-36"><SelectValue placeholder="Amount" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any amount</SelectItem>
            <SelectItem value="low">Under $100</SelectItem>
            <SelectItem value="mid">$100 – $200</SelectItem>
            <SelectItem value="high">Over $200</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Transactions table (full width) */}
      <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Transaction</TableHead>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-12 pr-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p) => (
              <TableRow key={p.id} onClick={() => openDetail(p.id)} className="cursor-pointer">
                <TableCell className="pl-4 font-medium tabular-nums">{p.id}</TableCell>
                <TableCell className="tabular-nums text-muted-foreground">{p.orderId}</TableCell>
                <TableCell>{p.customer}</TableCell>
                <TableCell className="text-right tabular-nums">{usd(p.amount)}</TableCell>
                <TableCell className="text-muted-foreground">{p.method}</TableCell>
                <TableCell>
                  <Badge className={cn('font-normal', statusMeta[p.status].badge)}>{statusMeta[p.status].label}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{p.date}</TableCell>
                <TableCell className="pr-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8" aria-label="Actions">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => openDetail(p.id)}>
                        <Eye className="size-4" /> View
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive" onClick={() => remove(p.id)}>
                        <Trash2 className="size-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">No transactions found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
