'use client'

import { useMemo, useState } from 'react'
import {
  Search,
  Download,
  Star,
  Eye,
  MoreHorizontal,
  Check,
  EyeOff,
  Trash2,
  MessageSquare,
  Flag,
  Clock,
  Star as StarIcon,
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
import { reviews as seedReviews, type Review, type ReviewStatus } from '@/app/admin/reviews/data'

const statusMeta: Record<ReviewStatus, { label: string; className: string }> = {
  approved: { label: 'Approved', className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  pending: { label: 'Pending', className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  reported: { label: 'Reported', className: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' },
  hidden: { label: 'Hidden', className: 'bg-muted text-muted-foreground' },
}

function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-0.5', className)} aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            'size-3.5',
            i < rating ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted-foreground/30'
          )}
        />
      ))}
    </span>
  )
}

function StatTile({
  label,
  value,
  icon: Icon,
  accent,
  hint,
}: {
  label: string
  value: string
  icon: LucideIcon
  accent: string
  hint?: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
      <span
        className="flex size-11 items-center justify-center rounded-lg"
        style={{ background: `color-mix(in oklch, ${accent} 14%, transparent)`, color: accent }}
      >
        <Icon className="size-5" />
      </span>
      <div className="leading-tight">
        <p className="flex items-center gap-1.5 text-2xl font-semibold tracking-tight tabular-nums">
          {value}
          {hint}
        </p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

export function ReviewsView() {
  const [items, setItems] = useState<Review[]>(seedReviews)
  const [query, setQuery] = useState('')
  const [rating, setRating] = useState<string>('all')
  const [status, setStatus] = useState<ReviewStatus | 'all'>('all')
  const [product, setProduct] = useState<string>('all')
  const [selectedId, setSelectedId] = useState<string | null>(seedReviews[0]?.id ?? null)

  const productOptions = useMemo(
    () => Array.from(new Set(seedReviews.map((r) => r.product))).sort(),
    []
  )

  const stats = useMemo(() => {
    const total = items.length
    const avg = total ? items.reduce((s, r) => s + r.rating, 0) / total : 0
    const pending = items.filter((r) => r.status === 'pending').length
    const reported = items.filter((r) => r.status === 'reported').length
    return { total, avg, pending, reported }
  }, [items])

  const distribution = useMemo(() => {
    const total = items.length || 1
    return [5, 4, 3, 2, 1].map((star) => {
      const count = items.filter((r) => r.rating === star).length
      return { star, count, percent: Math.round((count / total) * 100) }
    })
  }, [items])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((r) => {
      const matchesQuery =
        !q ||
        r.product.toLowerCase().includes(q) ||
        r.customer.toLowerCase().includes(q) ||
        r.comment.toLowerCase().includes(q)
      const matchesRating = rating === 'all' || r.rating === Number(rating)
      const matchesStatus = status === 'all' || r.status === status
      const matchesProduct = product === 'all' || r.product === product
      return matchesQuery && matchesRating && matchesStatus && matchesProduct
    })
  }, [items, query, rating, status, product])

  const selected = items.find((r) => r.id === selectedId) ?? null

  function setReviewStatus(id: string, next: ReviewStatus) {
    setItems((prev) => prev.map((r) => (r.id === id ? { ...r, status: next } : r)))
  }

  function removeReview(id: string) {
    setItems((prev) => prev.filter((r) => r.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  function exportCsv() {
    const header = ['Product', 'Customer', 'Rating', 'Status', 'Date', 'Comment']
    const rows = filtered.map((r) => [
      r.product,
      r.customer,
      r.rating,
      r.status,
      r.date,
      `"${r.comment.replace(/"/g, '""')}"`,
    ])
    const csv = [header, ...rows].map((row) => row.join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'reviews.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reviews Management</h1>
          <p className="text-sm text-muted-foreground">
            Moderate customer reviews across your products.
          </p>
        </div>
        <Button variant="outline" onClick={exportCsv}>
          <Download className="size-4" />
          Export
        </Button>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Total Reviews" value={stats.total.toLocaleString()} icon={MessageSquare} accent="oklch(0.55 0.22 264)" />
        <StatTile
          label="Average Rating"
          value={stats.avg.toFixed(1)}
          icon={StarIcon}
          accent="oklch(0.77 0.16 70)"
          hint={<Star className="size-4 fill-amber-400 text-amber-400" />}
        />
        <StatTile label="Pending Reviews" value={stats.pending.toLocaleString()} icon={Clock} accent="oklch(0.7 0.14 195)" />
        <StatTile label="Reported Reviews" value={stats.reported.toLocaleString()} icon={Flag} accent="oklch(0.65 0.22 16)" />
      </div>

      {/* Rating distribution */}
      <div className="rounded-xl bg-card p-5 ring-1 ring-foreground/10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-medium">Rating Distribution</h2>
          <span className="text-xs text-muted-foreground">Last 30 days</span>
        </div>
        <div className="flex flex-col gap-2.5">
          {distribution.map((d) => (
            <div key={d.star} className="flex items-center gap-3">
              <span className="flex w-12 shrink-0 items-center gap-1 text-sm tabular-nums">
                {d.star} <Star className="size-3.5 fill-amber-400 text-amber-400" />
              </span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-amber-400 transition-all"
                  style={{ width: `${d.percent}%` }}
                />
              </div>
              <span className="w-10 shrink-0 text-right text-sm tabular-nums text-muted-foreground">
                {d.percent}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
        <div className="relative min-w-50 flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search reviews…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-9 pl-8"
          />
        </div>
        <Select value={rating} onValueChange={setRating}>
          <SelectTrigger size="sm" className="w-32"><SelectValue placeholder="Rating" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All ratings</SelectItem>
            {[5, 4, 3, 2, 1].map((n) => (
              <SelectItem key={n} value={String(n)}>{n} stars</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => setStatus(v as ReviewStatus | 'all')}>
          <SelectTrigger size="sm" className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="reported">Reported</SelectItem>
            <SelectItem value="hidden">Hidden</SelectItem>
          </SelectContent>
        </Select>
        <Select value={product} onValueChange={setProduct}>
          <SelectTrigger size="sm" className="w-40"><SelectValue placeholder="Product" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All products</SelectItem>
            {productOptions.map((p) => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table + detail */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Reviews table */}
        <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 lg:col-span-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Product</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead className="max-w-0">Review</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-20 pr-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow
                  key={r.id}
                  onClick={() => setSelectedId(r.id)}
                  className={cn('cursor-pointer', selectedId === r.id && 'bg-accent/60')}
                >
                  <TableCell className="pl-4 font-medium">{r.product}</TableCell>
                  <TableCell className="text-muted-foreground">{r.customer}</TableCell>
                  <TableCell><Stars rating={r.rating} /></TableCell>
                  <TableCell className="max-w-0 truncate text-muted-foreground">{r.comment}</TableCell>
                  <TableCell>
                    <Badge className={cn('font-normal', statusMeta[r.status].className)}>
                      {statusMeta[r.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="pr-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        aria-label="View review"
                        onClick={() => setSelectedId(r.id)}
                      >
                        <Eye className="size-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8" aria-label="More actions">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => setReviewStatus(r.id, 'approved')}>
                            <Check className="size-4" /> Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setReviewStatus(r.id, 'hidden')}>
                            <EyeOff className="size-4" /> Hide
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" onClick={() => removeReview(r.id)}>
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
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No reviews found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 rounded-xl bg-card ring-1 ring-foreground/10">
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="font-medium">Review Details</h2>
              {selected && <Stars rating={selected.rating} />}
            </div>

            {selected ? (
              <div className="flex flex-col gap-4 p-4">
                <dl className="flex flex-col gap-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Product</dt>
                    <dd className="text-right font-medium">{selected.product}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Customer</dt>
                    <dd className="text-right">{selected.customer}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Date</dt>
                    <dd className="text-right">{selected.date}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Status</dt>
                    <dd>
                      <Badge className={cn('font-normal', statusMeta[selected.status].className)}>
                        {statusMeta[selected.status].label}
                      </Badge>
                    </dd>
                  </div>
                </dl>

                <div>
                  <p className="mb-1 text-sm text-muted-foreground">Review</p>
                  <blockquote className="rounded-lg border-l-2 border-amber-400 bg-muted/40 p-3 text-sm italic">
                    “{selected.comment}”
                  </blockquote>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-600/90"
                    disabled={selected.status === 'approved'}
                    onClick={() => setReviewStatus(selected.id, 'approved')}
                  >
                    <Check className="size-4" /> Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={selected.status === 'hidden'}
                    onClick={() => setReviewStatus(selected.id, 'hidden')}
                  >
                    <EyeOff className="size-4" /> Hide
                  </Button>
                  <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => removeReview(selected.id)}>
                    <Trash2 className="size-4" /> Delete
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 p-10 text-center text-sm text-muted-foreground">
                <MessageSquare className="size-8 opacity-40" />
                Select a review to see its details.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
