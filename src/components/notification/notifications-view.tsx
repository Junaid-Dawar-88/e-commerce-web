'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  ShoppingBag,
  CreditCard,
  User,
  Server,
  CheckCheck,
  X,
  BellOff,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  notifications as seedNotifications,
  mapNotification,
  type Notification,
  type NotifCategory,
  type NotifTone,
} from '@/app/admin/notification/data'
import {
  deleteNotification,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/app/api/notification-helper/notification-helper'

const categoryIcon: Record<NotifCategory, LucideIcon> = {
  orders: ShoppingBag,
  payments: CreditCard,
  users: User,
  system: Server,
}

const toneStyle: Record<NotifTone, string> = {
  success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  error: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  info: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
}

const tabs: { value: NotifCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'orders', label: 'Orders' },
  { value: 'payments', label: 'Payments' },
  { value: 'users', label: 'Users' },
  { value: 'system', label: 'System' },
]

export function NotificationsView() {
  const [items, setItems] = useState<Notification[]>(seedNotifications)
  const [tab, setTab] = useState<NotifCategory | 'all'>('all')

  useEffect(() => {
    getNotifications()
      .then((rows) => setItems(rows.map(mapNotification)))
      .catch(() => {
        // Leave the feed empty if the API is unavailable.
      })
  }, [])

  const unread = useMemo(() => items.filter((n) => !n.read).length, [items])
  const filtered = useMemo(
    () => (tab === 'all' ? items : items.filter((n) => n.category === tab)),
    [items, tab]
  )

  async function markRead(id: string) {
    await markNotificationRead(id, true)
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  async function markAllRead() {
    await markAllNotificationsRead()
    setItems((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  async function dismiss(id: string) {
    await deleteNotification(id)
    setItems((prev) => prev.filter((n) => n.id !== id))
  }

  const countOf = (cat: NotifCategory | 'all') =>
    cat === 'all' ? items.filter((n) => !n.read).length : items.filter((n) => n.category === cat && !n.read).length

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      {/* Header */}
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            Notifications
            {unread > 0 && (
              <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground tabular-nums">
                {unread}
              </span>
            )}
          </h1>
          <p className="text-sm text-muted-foreground">Stay on top of store activity.</p>
        </div>
        <Button variant="outline" size="sm" onClick={markAllRead} disabled={unread === 0}>
          <CheckCheck className="size-4" /> Mark all read
        </Button>
      </header>

      {/* Filter tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as NotifCategory | 'all')}>
        <TabsList>
          {tabs.map((t) => {
            const n = countOf(t.value)
            return (
              <TabsTrigger key={t.value} value={t.value} className="gap-1.5">
                {t.label}
                {n > 0 && (
                  <Badge className="h-4 min-w-4 justify-center rounded-full bg-primary/15 px-1 text-[10px] font-medium text-primary tabular-nums">
                    {n}
                  </Badge>
                )}
              </TabsTrigger>
            )
          })}
        </TabsList>
      </Tabs>

      {/* Feed */}
      <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-12 text-center text-sm text-muted-foreground">
            <BellOff className="size-8 opacity-40" />
            You&apos;re all caught up.
          </div>
        ) : (
          <ul className="divide-y">
            {filtered.map((n) => {
              const Icon = categoryIcon[n.category]
              return (
                <li
                  key={n.id}
                  onClick={() => !n.read && markRead(n.id)}
                  className={cn(
                    'group flex gap-3 p-4 transition-colors',
                    !n.read && 'cursor-pointer bg-accent/40 hover:bg-accent/60'
                  )}
                >
                  <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-lg', toneStyle[n.tone])}>
                    <Icon className="size-5" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className={cn('text-sm', !n.read ? 'font-semibold' : 'font-medium')}>{n.title}</p>
                    {n.lines?.map((line) => (
                      <p key={line} className="text-sm text-muted-foreground">{line}</p>
                    ))}
                    <p className="mt-1 text-xs text-muted-foreground">{n.time}</p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {!n.read && <span className="size-2 rounded-full bg-primary" aria-label="Unread" />}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); dismiss(n.id) }}
                      aria-label="Dismiss"
                      className="flex size-7 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground group-hover:opacity-100"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
