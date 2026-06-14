'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Printer,
  Download,
  RotateCcw,
  CreditCard,
  type LucideIcon,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useMoney, useStore } from '@/components/store-provider'
import { printReceipt, downloadReceiptPdf } from '@/components/payment/receipt-dialog'
import { updateOrder } from '@/app/api/order-helper/order-helper'
import type { Payment, PaymentStatus } from '@/app/admin/payment/data'

const statusMeta: Record<PaymentStatus, { label: string; badge: string }> = {
  paid: { label: 'Paid', badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  pending: { label: 'Pending', badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  failed: { label: 'Failed', badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' },
  refunded: { label: 'Refunded', badge: 'bg-violet-500/10 text-violet-600 dark:text-violet-400' },
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className={cn('mt-1 font-medium', mono && 'tabular-nums')}>{value}</dd>
    </div>
  )
}

export function PaymentDetail({ payment }: { payment: Payment }) {
  const usd = useMoney()
  const store = useStore()
  const [status, setStatus] = useState<PaymentStatus>(payment.status)
  const [refunding, setRefunding] = useState(false)
  const current: Payment = { ...payment, status }

  // Refunds persist to the underlying order's payment status in Neon.
  async function refund() {
    setStatus('refunded')
    setRefunding(true)
    try {
      await updateOrder(payment.id, { paymentStatus: 'refunded' })
    } catch {
      setStatus(payment.status) // revert on failure
    } finally {
      setRefunding(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="icon" className="size-9">
            <Link href="/admin/payment" aria-label="Back to payments">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight tabular-nums">{current.id}</h1>
            <p className="text-sm text-muted-foreground">Transaction details</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => printReceipt(current, store)}>
            <Printer className="size-4" /> Print
          </Button>
          <Button variant="outline" onClick={() => downloadReceiptPdf(current, store)}>
            <Download className="size-4" /> Export PDF
          </Button>
          <Button
            variant="destructive"
            disabled={status === 'refunded' || refunding}
            onClick={refund}
          >
            <RotateCcw className="size-4" /> Refund
          </Button>
        </div>
      </div>

      {/* Amount banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-card p-6 ring-1 ring-foreground/10">
        <div className="flex items-center gap-4">
          <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CreditCard className="size-6" />
          </span>
          <div>
            <p className="text-3xl font-semibold tracking-tight tabular-nums">{usd(current.amount)}</p>
            <p className="text-sm text-muted-foreground">via {current.method}</p>
          </div>
        </div>
        <Badge className={cn('px-3 py-1 text-sm font-normal', statusMeta[status].badge)}>
          {statusMeta[status].label}
        </Badge>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl bg-card p-6 ring-1 ring-foreground/10 lg:col-span-2">
          <h2 className="mb-4 font-medium">Transaction Information</h2>
          <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Transaction ID" value={current.id} mono />
            <Field label="Order ID" value={current.orderId} mono />
            <Field label="Customer" value={current.customer} />
            <Field label="Email" value={current.email} />
            <Field label="Payment Method" value={current.method} />
            <Field label="Transaction Date" value={current.dateLong} />
            <div className="sm:col-span-2">
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Billing Address</dt>
              <dd className="mt-1 font-medium">{current.billingAddress}</dd>
            </div>
          </dl>
        </div>

        {/* Payout breakdown */}
        <div className="rounded-xl bg-card p-6 ring-1 ring-foreground/10">
          <h2 className="mb-4 font-medium">Payout Breakdown</h2>
          <dl className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Gross Amount</dt>
              <dd className="tabular-nums">{usd(current.amount)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Platform Fee (10%)</dt>
              <dd className="tabular-nums">-{usd(current.platformFee)}</dd>
            </div>
            <div className="flex justify-between border-t pt-3 text-base font-semibold">
              <dt>Seller Earnings</dt>
              <dd className="tabular-nums text-emerald-600 dark:text-emerald-400">{usd(current.sellerEarnings)}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}
