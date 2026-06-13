'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Pencil,
  Trash2,
  FolderTree,
  Layers,
  Package,
  Link2,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { deleteCategory as apiDeleteCategory } from '@/app/api/category-helper/category-helper'
import type { Category, CategoryStatus } from '@/app/admin/categories/data'

const statusMeta: Record<CategoryStatus, { label: string; className: string }> = {
  active: { label: 'Active', className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  inactive: { label: 'Inactive', className: 'bg-muted text-muted-foreground' },
}

const isImageSrc = (s: string) => /^(data:image\/|https?:\/\/|\/)/.test(s)

function Avatar({ src, className }: { src: string; className?: string }) {
  if (src && isImageSrc(src)) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" className={cn('rounded-lg object-cover ring-1 ring-foreground/10', className)} />
  }
  return (
    <span className={cn('flex items-center justify-center rounded-lg bg-muted', className)}>
      {src || '📦'}
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

function Stat({ value, label, accent }: { value: string | number; label: string; accent?: string }) {
  return (
    <div className="rounded-lg bg-muted/50 p-3 text-center">
      <p className={cn('text-xl font-semibold tabular-nums', accent)}>{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

export function CategoryDetail({ category }: { category: Category }) {
  const router = useRouter()
  const status = statusMeta[category.status]
  const activeSubs = category.subcategories.filter((s) => s.status === 'active').length

  async function handleDelete() {
    if (!confirm(`Delete "${category.name}" and its subcategories? This cannot be undone.`)) return
    await apiDeleteCategory(Number(category.id))
    router.push('/admin/categories')
    router.refresh()
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="icon" className="size-9">
            <Link href="/admin/categories" aria-label="Back to categories">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <Avatar src={category.image} className="size-12 text-2xl" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">{category.name}</h1>
              <Badge className={cn('font-normal', status.className)}>{status.label}</Badge>
            </div>
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <Link2 className="size-3.5" />
              {category.slug || '—'}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/categories?edit=${category.id}`}>
              <Pencil className="size-4" /> Edit
            </Link>
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="size-4" /> Delete
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat value={category.subcategories.length} label="Subcategories" />
        <Stat value={activeSubs} label="Active subcategories" accent="text-emerald-600 dark:text-emerald-400" />
        <Stat value={category.products} label="Products" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Left: details */}
        <div className="flex flex-col gap-4">
          <Card title="Details" icon={<FolderTree className="size-4" />}>
            <dl className="flex flex-col gap-4">
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Name</dt>
                <dd className="mt-0.5 font-medium">{category.name}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Slug</dt>
                <dd className="mt-0.5 font-mono text-sm">{category.slug || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Status</dt>
                <dd className="mt-0.5">
                  <Badge className={cn('font-normal', status.className)}>{status.label}</Badge>
                </dd>
              </div>
            </dl>
          </Card>

          <Card title="Description" icon={<Package className="size-4" />}>
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
              {category.description?.trim() || 'No description provided.'}
            </p>
          </Card>
        </div>

        {/* Right: subcategories */}
        <div className="lg:col-span-2">
          <Card
            title={`Subcategories (${category.subcategories.length})`}
            icon={<Layers className="size-4" />}
          >
            {category.subcategories.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No subcategories yet.
              </p>
            ) : (
              <ul className="flex flex-col divide-y">
                {category.subcategories.map((sub) => (
                  <li key={sub.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <Avatar src={sub.image} className="size-10 text-lg" />
                    <div className="min-w-0 flex-1 leading-tight">
                      <p className="truncate font-medium">{sub.name}</p>
                      <p className="truncate font-mono text-xs text-muted-foreground">
                        {sub.slug || '—'}
                      </p>
                    </div>
                    <span className="hidden text-sm text-muted-foreground sm:block">
                      {sub.products} products
                    </span>
                    <Badge className={cn('font-normal', statusMeta[sub.status].className)}>
                      {statusMeta[sub.status].label}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
