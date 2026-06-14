'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Star,
  Check,
  EyeOff,
  Trash2,
  Package,
  MessageSquare,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Review, ReviewStatus } from '@/app/admin/reviews/data'
import { deleteReview, updateReview } from '@/app/api/review-helper/review-helper'

const statusMeta: Record<ReviewStatus, { label: string; className: string }> = {
  approved: { label: 'Approved', className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  pending: { label: 'Pending', className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  reported: { label: 'Reported', className: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' },
  hidden: { label: 'Hidden', className: 'bg-muted text-muted-foreground' },
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn('size-4', i < rating ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted-foreground/30')}
        />
      ))}
    </span>
  )
}

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

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-medium">{value}</dd>
    </div>
  )
}

export function ReviewDetail({ review }: { review: Review }) {
  const router = useRouter()
  const [status, setStatus] = useState<ReviewStatus>(review.status)
  const [pending, setPending] = useState(false)

  async function setReviewStatus(next: ReviewStatus) {
    const prev = status
    setStatus(next)
    setPending(true)
    try {
      await updateReview(review.id, { status: next })
      router.refresh()
    } catch {
      setStatus(prev) // revert on failure
    } finally {
      setPending(false)
    }
  }

  async function remove() {
    if (!confirm('Delete this review? This cannot be undone.')) return
    setPending(true)
    try {
      await deleteReview(review.id)
      router.push('/admin/reviews')
      router.refresh()
    } catch {
      setPending(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="icon" className="size-9">
            <Link href="/admin/reviews" aria-label="Back to reviews">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">{review.product}</h1>
              <Badge className={cn('font-normal', statusMeta[status].className)}>
                {statusMeta[status].label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">Review by {review.customer}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            className="bg-emerald-600 hover:bg-emerald-600/90"
            disabled={pending || status === 'approved'}
            onClick={() => setReviewStatus('approved')}
          >
            <Check className="size-4" /> Approve
          </Button>
          <Button
            variant="outline"
            disabled={pending || status === 'hidden'}
            onClick={() => setReviewStatus('hidden')}
          >
            <EyeOff className="size-4" /> Hide
          </Button>
          <Button variant="destructive" disabled={pending} onClick={remove}>
            <Trash2 className="size-4" /> Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* The review itself */}
        <div className="lg:col-span-2">
          <Card title="Review" icon={<MessageSquare className="size-4" />}>
            <div className="mb-3 flex items-center gap-2">
              <Stars rating={review.rating} />
              <span className="text-sm text-muted-foreground tabular-nums">
                {review.rating}.0 out of 5
              </span>
            </div>
            <blockquote className="rounded-lg border-l-2 border-amber-400 bg-muted/40 p-4 text-sm italic leading-relaxed">
              “{review.comment}”
            </blockquote>
          </Card>
        </div>

        {/* Metadata */}
        <div className="flex flex-col gap-4">
          <Card title="Details" icon={<Package className="size-4" />}>
            <dl className="flex flex-col gap-4">
              <Field label="Product" value={review.product} />
              <Field label="Customer" value={review.customer} />
              <Field label="Date" value={review.date} />
              <Field label="Rating" value={`${review.rating} / 5`} />
            </dl>
          </Card>
        </div>
      </div>
    </div>
  )
}
