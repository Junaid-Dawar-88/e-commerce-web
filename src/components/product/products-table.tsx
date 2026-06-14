'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Plus, MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-react'
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
import { useMoney } from '@/components/store-provider'
import { products as seedProducts, type Product, type ProductStatus } from '@/app/admin/product/data'
import { addProduct, deleteProduct, getProducts, updateProduct } from '@/app/api/product-helper/product-helper'
import ProductModal, { type NewProduct } from './product-modal'

const statusMeta: Record<ProductStatus, { label: string; className: string }> = {
  Active: { label: 'Active', className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  Draft: { label: 'Draft', className: 'bg-muted text-muted-foreground' },
  Out_of_stock: { label: 'Out of Stock', className: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' },
}

// `picture` may hold a real image (data/URL) or a legacy emoji/text value.
const isImageSrc = (s: string) =>
  /^(data:image\/|https?:\/\/|\/)/.test(s)

export function ProductsTable({ className }: { className?: string }) {
  const router = useRouter()
  const usd = useMoney()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<ProductStatus | 'all'>('all')
  const [items, setItems] = useState<Product[]>(seedProducts)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)

  useEffect(() => {
    getProducts()
      .then(setItems)
      .catch(() => {
        // Leave the table empty if the API is unavailable.
      })
  }, [])

  // Support deep-linking to edit a product, e.g. /admin/product?edit=12
  // (used by the "Edit" button on the product detail page).
  const editId = searchParams.get('edit')
  useEffect(() => {
    if (!editId) return
    const target = items.find((p) => String(p.id) === editId)
    if (target) {
      setEditing(target)
      setModalOpen(true)
    }
  }, [editId, items])

  function openAdd() {
    setEditing(null)
    setModalOpen(true)
  }

  function handleEdit(p: Product) {
    setEditing(p)
    setModalOpen(true)
  }

  async function handleSave(product: NewProduct) {
    if (editing?.id != null) {
      const updated = await updateProduct(editing.id, { ...product, id: editing.id })
      setItems((prev) => prev.map((item) => (item.id === editing.id ? updated : item)))
    } else {
      const created = await addProduct(product)
      setItems((prev) => [created, ...prev])
    }
  }

  function handleView(p: Product) {
    if (p.id == null) return
    router.push(`/admin/product/${p.id}`)
  }

  async function handleDelete(p: Product) {
    if (p.id == null) return
    await deleteProduct(p.id)
    setItems((prev) => prev.filter((item) => item.id !== p.id))
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((p) => {
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.seller.toLowerCase().includes(q)
      const matchesStatus = status === 'all' || p.status === status
      return matchesQuery && matchesStatus
    })
  }, [items, query, status])

  return (
    <div className={cn('flex flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10', className)}>
      {/* Toolbar (fixed) */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b p-4">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search name, SKU, seller…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-9 pl-8"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={status} onValueChange={(v) => setStatus(v as ProductStatus | 'all')}>
            <SelectTrigger size="sm" className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="Out_of_stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" onClick={openAdd}>
            <Plus className="size-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Table — only the body scrolls; header stays pinned */}
      <Table containerClassName="min-h-0 flex-1 overflow-y-auto">
        <TableHeader className="sticky top-0 z-10 bg-card [&_th]:bg-card [&_tr]:border-b [&_tr]:hover:bg-card">
          <TableRow>
            <TableHead className="w-16 pl-4">Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Seller</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Stock</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-12 pr-4 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="pl-4">
                {p.picture && isImageSrc(p.picture) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.picture}
                    alt={p.name}
                    className="size-10 shrink-0 rounded-lg object-cover ring-1 ring-foreground/10"
                  />
                ) : (
                  <span className="flex size-10 items-center justify-center rounded-lg bg-muted text-xl">
                    {p.picture || '📦'}
                  </span>
                )}
              </TableCell>
              <TableCell className="font-medium">{p.name}</TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">{p.sku}</TableCell>
              <TableCell>
                <Badge variant="outline" className="font-normal">{p.category}</Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">{p.seller}</TableCell>
              <TableCell className="text-right tabular-nums">{usd(Number(p.price))}</TableCell>
              <TableCell className="text-right tabular-nums">
                {Number(p.stock) === 0 ? (
                  <span className="text-rose-600 dark:text-rose-400">Out</span>
                ) : (
                  <span className={cn(Number(p.stock) < 10 && 'text-amber-600 dark:text-amber-400')}>
                    {p.stock}
                  </span>
                )}
              </TableCell>
              <TableCell>
                <Badge className={cn('font-normal', statusMeta[p.status].className)}>
                  {statusMeta[p.status].label}
                </Badge>
              </TableCell>
              <TableCell className="pr-4 text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      aria-label={`Actions for ${p.name}`}
                    >
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-36">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => handleView(p)}>
                      <Eye className="size-4" />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEdit(p)}>
                      <Pencil className="size-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onClick={() => handleDelete(p)}>
                      <Trash2 className="size-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                No products found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Footer count (fixed) */}
      <div className="shrink-0 border-t px-4 py-3 text-sm text-muted-foreground">
        Showing {filtered.length} of {items.length} products
      </div>

      <ProductModal
        open={modalOpen}
        onOpenChange={(next) => {
          setModalOpen(next)
          // Drop the ?edit= deep-link param so the modal doesn't reopen.
          if (!next && editId) router.replace('/admin/product')
        }}
        onSave={handleSave}
        initial={editing}
      />
    </div>
  )
}
