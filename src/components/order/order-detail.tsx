'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  CreditCard,
  CalendarDays,
  Receipt,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useMoney } from '@/components/store-provider'
import { updateOrder } from '@/app/api/order-helper/order-helper'
import type { Order, OrderStatus, PaymentStatus } from '@/app/admin/order/data'

const statusMeta: Record<OrderStatus, { label: string; badge: string }> = {
  pending: { label: 'Pending', badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  processing: { label: 'Processing', badge: 'bg-sky-500/10 text-sky-600 dark:text-sky-400' },
  shipped: { label: 'Shipped', badge: 'bg-violet-500/10 text-violet-600 dark:text-violet-400' },
  delivered: { label: 'Delivered', badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  cancelled: { label: 'Cancelled', badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' },
}

const paymentMeta: Record<PaymentStatus, { label: string; badge: string }> = {
  paid: { label: 'Paid', badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  cod: { label: 'COD', badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  unpaid: { label: 'Unpaid', badge: 'bg-muted text-muted-foreground' },
  refunded: { label: 'Refunded', badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' },
}

const ORDER_STATUSES: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
const PAYMENT_STATUSES: PaymentStatus[] = ['unpaid', 'paid', 'cod', 'refunded']

function Card({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-card p-5 ring-1 ring-foreground/10">
      <h2 className="mb-4 flex items-center gap-2 font-medium">
        <span className="text-muted-foreground">{icon}</span>
        {title}
      </h2>
      {children}
    </div>
  )
}

export function OrderDetail({ order }: { order: Order }) {
  const money = useMoney()
  const [status, setStatus] = useState<OrderStatus>(order.status)
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(order.paymentStatus)
  const [saving, setSaving] = useState(false)

  const shortId = order.id.slice(-8).toUpperCase()
  const itemsTotal = order.items.reduce((sum, i) => sum + i.price * i.qty, 0)
  const extra = Math.max(0, order.amount - itemsTotal)

  async function save(next: { status?: OrderStatus; paymentStatus?: PaymentStatus }) {
    setSaving(true)
    if (next.status) setStatus(next.status)
    if (next.paymentStatus) setPaymentStatus(next.paymentStatus)
    try {
      await updateOrder(order.id, next)
    } catch {
      // Revert on failure.
      setStatus(order.status)
      setPaymentStatus(order.paymentStatus)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="icon" className="size-9">
            <Link href="/admin/order" aria-label="Back to orders">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Order #{shortId}</h1>
              <Badge className={cn('font-normal', statusMeta[status].badge)}>{statusMeta[status].label}</Badge>
              <Badge className={cn('font-normal', paymentMeta[paymentStatus].badge)}>{paymentMeta[paymentStatus].label}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{order.customer} · {order.date}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={status} onValueChange={(v) => save({ status: v as OrderStatus })} disabled={saving}>
            <SelectTrigger size="sm" className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              {ORDER_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>{statusMeta[s].label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={paymentStatus} onValueChange={(v) => save({ paymentStatus: v as PaymentStatus })} disabled={saving}>
            <SelectTrigger size="sm" className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              {PAYMENT_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>{paymentMeta[s].label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Left: items + totals */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card title="Items" icon={<Package className="size-4" />}>
            <ul className="divide-y divide-border/60">
              {order.items.map((item, i) => (
                <li key={`${item.name}-${i}`} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.variant ? `Size ${item.variant} · ` : ''}Qty {item.qty} × {money(item.price)}
                    </p>
                  </div>
                  <span className="shrink-0 font-medium tabular-nums">{money(item.price * item.qty)}</span>
                </li>
              ))}
              {order.items.length === 0 && (
                <li className="py-3 text-sm text-muted-foreground">No items on this order.</li>
              )}
            </ul>
          </Card>

          <Card title="Summary" icon={<Receipt className="size-4" />}>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Items</dt>
                <dd className="tabular-nums">{money(itemsTotal)}</dd>
              </div>
              {extra > 0 && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Delivery / other</dt>
                  <dd className="tabular-nums">{money(extra)}</dd>
                </div>
              )}
              <div className="flex justify-between border-t border-border/60 pt-2 text-base font-semibold">
                <dt>Total</dt>
                <dd className="tabular-nums">{money(order.amount)}</dd>
              </div>
            </dl>
          </Card>
        </div>

        {/* Right: customer, shipping, payment */}
        <div className="flex flex-col gap-4">
          <Card title="Customer" icon={<User className="size-4" />}>
            <p className="font-medium">{order.customer}</p>
            {order.email && <p className="text-sm text-muted-foreground">{order.email}</p>}
          </Card>

          <Card title="Shipping address" icon={<MapPin className="size-4" />}>
            <p className="text-sm leading-relaxed whitespace-pre-line">
              {order.shippingAddress || '—'}
            </p>
          </Card>

          <Card title="Payment" icon={<CreditCard className="size-4" />}>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Method</dt>
                <dd className="mt-0.5 font-medium wrap-break-word">{order.paymentMethod || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Status</dt>
                <dd className="mt-0.5">
                  <Badge className={cn('font-normal', paymentMeta[paymentStatus].badge)}>{paymentMeta[paymentStatus].label}</Badge>
                </dd>
              </div>
              {order.paymentProof && (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">Payment screenshot</dt>
                  <dd className="mt-1">
                    <a href={order.paymentProof} target="_blank" rel="noopener noreferrer" title="Open full size">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={order.paymentProof}
                        alt="Payment screenshot"
                        className="max-h-72 w-full rounded-lg border border-border object-contain"
                      />
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </Card>

          <Card title="Placed" icon={<CalendarDays className="size-4" />}>
            <p className="font-medium">{order.date}</p>
            <p className="text-sm text-muted-foreground">
              {order.daysAgo === 0 ? 'Today' : `${order.daysAgo} day${order.daysAgo === 1 ? '' : 's'} ago`}
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
