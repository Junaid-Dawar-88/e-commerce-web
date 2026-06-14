'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Bell,
  ShoppingBag,
  CreditCard,
  User,
  Server,
  CheckCheck,
  type LucideIcon,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import {
  mapNotification,
  type Notification,
  type NotifCategory,
  type NotifTone,
} from '@/app/admin/notification/data'
import {
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

// How many to preview in the dropdown; the rest live on the full page.
const PREVIEW = 6

export function NotificationBell() {
  const [items, setItems] = useState<Notification[]>([])

  useEffect(() => {
    const load = () =>
      getNotifications()
        .then((rows) => setItems(rows.map(mapNotification)))
        .catch(() => {
          // Leave the feed empty if the API is unavailable / forbidden.
        })
    load()
    // Keep the badge reasonably fresh while the panel is open.
    const interval = setInterval(load, 60_000)
    return () => clearInterval(interval)
  }, [])

  const unread = useMemo(() => items.filter((n) => !n.read).length, [items])
  const recent = items.slice(0, PREVIEW)

  async function markRead(id: string) {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    try {
      await markNotificationRead(id, true)
    } catch {
      // Optimistic — ignore failures.
    }
  }

  async function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })))
    try {
      await markAllNotificationsRead()
    } catch {
      // Optimistic — ignore failures.
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
          className="relative flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Bell className="size-5" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground tabular-nums">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" sideOffset={8} className="w-80 p-0">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-3 py-2.5">
          <p className="text-sm font-semibold">
            Notifications
            {unread > 0 && (
              <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                {unread} unread
              </span>
            )}
          </p>
          {unread > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <CheckCheck className="size-3.5" /> Mark all read
            </button>
          )}
        </div>

        {/* Feed preview */}
        {recent.length === 0 ? (
          <div className="px-3 py-8 text-center text-sm text-muted-foreground">
            You&apos;re all caught up.
          </div>
        ) : (
          <ul className="max-h-80 divide-y overflow-y-auto">
            {recent.map((n) => {
              const Icon = categoryIcon[n.category]
              return (
                <li
                  key={n.id}
                  onClick={() => !n.read && markRead(n.id)}
                  className={cn(
                    'flex gap-3 px-3 py-3 transition-colors',
                    !n.read && 'cursor-pointer bg-accent/40 hover:bg-accent/60'
                  )}
                >
                  <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg', toneStyle[n.tone])}>
                    <Icon className="size-4.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={cn('truncate text-sm', !n.read ? 'font-semibold' : 'font-medium')}>
                      {n.title}
                    </p>
                    {n.lines?.[0] && (
                      <p className="truncate text-xs text-muted-foreground">{n.lines[0]}</p>
                    )}
                    <p className="mt-0.5 text-xs text-muted-foreground">{n.time}</p>
                  </div>
                  {!n.read && (
                    <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />
                  )}
                </li>
              )
            })}
          </ul>
        )}

        {/* Footer */}
        <div className="border-t p-1">
          <Link
            href="/admin/notification"
            className="flex items-center justify-center rounded-md px-2 py-2 text-sm font-medium text-primary transition-colors hover:bg-accent"
          >
            View all notifications
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
