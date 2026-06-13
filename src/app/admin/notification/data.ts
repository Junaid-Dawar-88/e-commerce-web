// Notification view-model types. Real data should come from the feed/API.

export type NotifCategory = 'orders' | 'payments' | 'users' | 'system'
export type NotifTone = 'success' | 'warning' | 'error' | 'info'

export type Notification = {
  id: string
  category: NotifCategory
  tone: NotifTone
  title: string
  lines?: string[]
  time: string
  read: boolean
}

export const notifications: Notification[] = []

// Shape returned by the API (mirrors the Prisma Notification).
export type NotificationRow = {
  id: string
  category: NotifCategory
  tone: NotifTone
  title: string
  lines: string[]
  read: boolean
  createdAt: Date | string
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function mapNotification(row: NotificationRow): Notification {
  return {
    id: row.id,
    category: row.category,
    tone: row.tone,
    title: row.title,
    lines: row.lines?.length ? row.lines : undefined,
    time: timeAgo(new Date(row.createdAt)),
    read: row.read,
  }
}
