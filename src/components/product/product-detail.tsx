'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Package,
  Tag,
  Store,
  Layers,
  Boxes,
  DollarSign,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useMoney } from '@/components/store-provider'
import { deleteProduct } from '@/app/api/product-helper/product-helper'
import type { ProductStatus } from '@/types/product'

// The product row as returned by the detail service (with optional relations).
type ProductDetailData = {
  id: number
  picture: string
  name: string
  sku: string
  category: string
  seller: string
  price: string
  stock: string
  status: ProductStatus
  description: string
  categoryRel?: { name: string } | null
  subcategoryRel?: { name: string } | null
}

const statusMeta: Record<ProductStatus, { label: string; className: string }> = {
  Active: { label: 'Active', className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  Draft: { label: 'Draft', className: 'bg-muted text-muted-foreground' },
  Out_of_stock: { label: 'Out of Stock', className: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' },
}

const isImageSrc = (s: string) => /^(data:image\/|https?:\/\/|\/)/.test(s)

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

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-muted-foreground">{icon}</span>
      <div>
        <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
        <dd className="mt-0.5 font-medium">{children}</dd>
      </div>
    </div>
  )
}

export function ProductDetail({ product }: { product: ProductDetailData }) {
  const router = useRouter()
  const usd = useMoney()
  const stock = Number(product.stock)
  const status = statusMeta[product.status]

  async function handleDelete() {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return
    await deleteProduct(product.id)
    router.push('/admin/product')
    router.refresh()
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="icon" className="size-9">
            <Link href="/admin/product" aria-label="Back to products">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">{product.name || 'Untitled product'}</h1>
              <Badge className={cn('font-normal', status.className)}>{status.label}</Badge>
            </div>
            <p className="font-mono text-sm text-muted-foreground">{product.sku || '—'}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/product?edit=${product.id}`}>
              <Pencil className="size-4" /> Edit
            </Link>
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="size-4" /> Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Left: image + description */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card title="Image" icon={<Package className="size-4" />}>
            {product.picture && isImageSrc(product.picture) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.picture}
                alt={product.name}
                className="aspect-video w-full rounded-lg object-cover ring-1 ring-foreground/10"
              />
            ) : (
              <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-muted text-5xl">
                {product.picture || '📦'}
              </div>
            )}
          </Card>

          <Card title="Description" icon={<Layers className="size-4" />}>
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
              {product.description?.trim() || 'No description provided.'}
            </p>
          </Card>
        </div>

        {/* Right: pricing + details */}
        <div className="flex flex-col gap-4">
          <Card title="Pricing & Stock" icon={<DollarSign className="size-4" />}>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Price</p>
                <p className="text-2xl font-semibold tabular-nums">{usd(Number(product.price))}</p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Stock</p>
                <p
                  className={cn(
                    'text-2xl font-semibold tabular-nums',
                    stock === 0 && 'text-rose-600 dark:text-rose-400',
                    stock > 0 && stock < 10 && 'text-amber-600 dark:text-amber-400'
                  )}
                >
                  {stock === 0 ? 'Out' : stock}
                </p>
              </div>
            </div>
          </Card>

          <Card title="Details" icon={<Tag className="size-4" />}>
            <dl className="flex flex-col gap-4">
              <Field label="Category" icon={<Tag className="size-4" />}>
                {product.categoryRel?.name || product.category || '—'}
              </Field>
              {product.subcategoryRel?.name && (
                <Field label="Subcategory" icon={<Layers className="size-4" />}>
                  {product.subcategoryRel.name}
                </Field>
              )}
              <Field label="Seller" icon={<Store className="size-4" />}>
                {product.seller || '—'}
              </Field>
              <Field label="SKU" icon={<Boxes className="size-4" />}>
                <span className="font-mono">{product.sku || '—'}</span>
              </Field>
            </dl>
          </Card>
        </div>
      </div>
    </div>
  )
}
