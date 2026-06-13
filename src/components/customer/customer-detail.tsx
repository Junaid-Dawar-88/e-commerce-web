'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ShoppingBag,
  Mail,
  Ban,
  CircleCheck,
  Trash2,
  Heart,
  Star,
  MapPin,
  Phone,
  CalendarDays,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Customer, CustomerStatus } from '@/app/admin/customer/data'

const statusMeta: Record<CustomerStatus, { label: string; badge: string }> = {
  active: { label: 'Active', badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  vip: { label: 'VIP', badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  blocked: { label: 'Blocked', badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' },
  inactive: { label: 'Inactive', badge: 'bg-muted text-muted-foreground' },
}

const usd = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
const initials = (name: string) => name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()

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

function Stat({ value, label, accent }: { value: string; label: string; accent?: string }) {
  return (
    <div className="rounded-lg bg-muted/50 p-3 text-center">
      <p className={cn('text-xl font-semibold tabular-nums', accent)}>{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

export function CustomerDetail({ customer }: { customer: Customer }) {
  const router = useRouter()
  const [status, setStatus] = useState<CustomerStatus>(customer.status)
  const isBlocked = status === 'blocked'

  function toggleBlock() {
    setStatus((prev) => (prev === 'blocked' ? 'active' : 'blocked'))
  }

  function deleteAccount() {
    if (confirm(`Delete ${customer.name}'s account? This cannot be undone.`)) {
      router.push('/admin/customer')
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="icon" className="size-9">
            <Link href="/admin/customer" aria-label="Back to customers">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-base font-semibold text-primary">
            {initials(customer.name)}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">{customer.name}</h1>
              <Badge className={cn('font-normal', statusMeta[status].badge)}>{statusMeta[status].label}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{customer.email}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => router.push('/admin/order')}>
            <ShoppingBag className="size-4" /> View Orders
          </Button>
          <Button asChild variant="outline">
            <a href={`mailto:${customer.email}`}>
              <Mail className="size-4" /> Send Email
            </a>
          </Button>
          <Button variant="outline" onClick={toggleBlock}>
            {isBlocked ? <CircleCheck className="size-4" /> : <Ban className="size-4" />}
            {isBlocked ? 'Unblock' : 'Block'}
          </Button>
          <Button variant="destructive" onClick={deleteAccount}>
            <Trash2 className="size-4" /> Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Left column */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card title="Customer Information" icon={<Phone className="size-4" />}>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Full Name" value={customer.name} />
              <Field label="Email" value={customer.email} />
              <Field label="Phone" value={customer.phone} />
              <Field label="Joined" value={customer.joinedLong} />
            </dl>
          </Card>

          <Card title="Order Summary" icon={<ShoppingBag className="size-4" />}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat value={String(customer.orders)} label="Total Orders" />
              <Stat value={String(customer.completed)} label="Completed" accent="text-emerald-600 dark:text-emerald-400" />
              <Stat value={String(customer.pending)} label="Pending" accent="text-amber-600 dark:text-amber-400" />
              <Stat value={String(customer.cancelled)} label="Cancelled" accent="text-rose-600 dark:text-rose-400" />
            </div>
            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <span className="text-sm text-muted-foreground">Total Spent</span>
              <span className="text-xl font-semibold tabular-nums">{usd(customer.totalSpent)}</span>
            </div>
          </Card>

          <Card title="Address" icon={<MapPin className="size-4" />}>
            <p className="text-sm leading-relaxed">
              {customer.city}<br />
              {customer.state}<br />
              {customer.country}
            </p>
          </Card>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          <Card title="Wishlist" icon={<Heart className="size-4" />}>
            <p className="text-3xl font-semibold tabular-nums">{customer.wishlist}</p>
            <p className="text-sm text-muted-foreground">Products saved</p>
          </Card>

          <Card title="Reviews" icon={<Star className="size-4" />}>
            <p className="text-3xl font-semibold tabular-nums">{customer.reviews}</p>
            <p className="text-sm text-muted-foreground">Reviews submitted</p>
            <div className="mt-3 flex items-center gap-2 border-t pt-3 text-sm">
              <span className="text-muted-foreground">Avg. rating given</span>
              <span className="ml-auto flex items-center gap-1 font-medium tabular-nums">
                {customer.avgRating || '—'}
                {customer.avgRating > 0 && <Star className="size-3.5 fill-amber-400 text-amber-400" />}
              </span>
            </div>
          </Card>

          <Card title="Member Since" icon={<CalendarDays className="size-4" />}>
            <p className="text-lg font-medium">{customer.joinedLong}</p>
            <p className="text-sm text-muted-foreground">{Math.floor(customer.daysAgo / 30)} months as a customer</p>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-medium">{value}</dd>
    </div>
  )
}
