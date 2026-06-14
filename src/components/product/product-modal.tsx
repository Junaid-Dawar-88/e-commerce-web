'use client'

import { useEffect, useRef, useState } from 'react'
import { ImagePlus, Upload, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { Product, ProductStatus } from '@/types/product'
import { getCategories } from '@/app/api/category-helper/category-helper'
import type { CategoryRow } from '@/app/admin/categories/data'

export type NewProduct = Omit<Product, 'id'> & { description: string }

const STATUS_OPTIONS: { value: ProductStatus; label: string }[] = [
  { value: 'Active', label: 'Active' },
  { value: 'Draft', label: 'Draft' },
  { value: 'Out_of_stock', label: 'Out of Stock' },
]

const EMPTY: NewProduct = {
  picture: '',
  name: '',
  sku: '',
  category: '',
  seller: '',
  price: '',
  stock: '',
  status: 'Active',
  description: '',
}

type ProductModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: (product: NewProduct) => void
  // When set, the modal is in edit mode and pre-fills with this product.
  initial?: NewProduct | null
}

const fieldLabel = 'mb-1.5 text-muted-foreground'

// Downscale an uploaded image and return a compact data URL we can store
// directly in the DB (no external storage needed). Caps the longest side and
// re-encodes as JPEG to keep the string small.
function fileToDataUrl(file: File, maxSide = 512): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(reader.error)
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Could not load image'))
      img.onload = () => {
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height))
        const w = Math.round(img.width * scale)
        const h = Math.round(img.height * scale)
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('Canvas unsupported'))
        ctx.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', 0.8))
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}

// Does this string point at a real image we can render in an <img>?
const isImageSrc = (s: string) =>
  /^(data:image\/|https?:\/\/|\/)/.test(s)

const ProductModal = ({ open, onOpenChange, onSave, initial }: ProductModalProps) => {
  const [form, setForm] = useState<NewProduct>(EMPTY)
  const [preview, setPreview] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  // Sync the form whenever the modal opens (edit -> prefill, add -> blank).
  useEffect(() => {
    if (open) {
      setForm(initial ?? EMPTY)
      // Show the existing image when editing a product that already has one.
      setPreview(initial && isImageSrc(initial.picture) ? initial.picture : null)
    }
  }, [open, initial])

  // Load the categories the admin actually created (from the database) each
  // time the modal opens, so newly added categories show up right away.
  useEffect(() => {
    if (!open) return
    getCategories()
      .then((rows: CategoryRow[]) => setCategories(rows.map((r) => ({ id: r.id, name: r.name }))))
      .catch(() => {
        // Leave the list empty if the API is unavailable.
      })
  }, [open])

  function update<K extends keyof NewProduct>(key: K, value: NewProduct[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleFile(file: File | undefined) {
    if (!file || !file.type.startsWith('image/')) return
    try {
      const dataUrl = await fileToDataUrl(file)
      setPreview(dataUrl)
      update('picture', dataUrl)
    } catch {
      // Ignore unreadable files.
    }
  }

  function reset() {
    setForm(EMPTY)
    setPreview(null)
  }

  function handleSubmit() {
    onSave?.(form)
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset()
        onOpenChange(next)
      }}
    >
      <DialogContent className="sm:max-w-xl" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="text-lg">
            {initial ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
          <DialogDescription>
            {initial ? 'Update this listing' : 'Create a new listing'}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmit()
          }}
          className="grid gap-4"
        >
          {/* Product Image */}
          <div>
            <Label className={fieldLabel}>
              <ImagePlus className="size-4" />
              Product Image
            </Label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            {preview ? (
              <div className="relative overflow-hidden rounded-lg ring-1 ring-foreground/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt="Product preview"
                  className="h-40 w-full object-cover"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setPreview(null)
                    update('picture', '')
                  }}
                  aria-label="Remove image"
                >
                  <X />
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragging(true)
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setDragging(false)
                  handleFile(e.dataTransfer.files?.[0])
                }}
                className={cn(
                  'flex h-32 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-input text-muted-foreground transition-colors hover:bg-muted/50',
                  dragging && 'border-ring bg-muted/50 text-foreground'
                )}
              >
                <Upload className="size-5" />
                <span className="text-sm font-medium">
                  Upload image
                </span>
                <span className="text-xs">or drag &amp; drop it here</span>
              </button>
            )}
          </div>

          {/* Name + SKU */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="name" className={fieldLabel}>
                Product Name
              </Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="Nike Air Max"
                required
              />
            </div>
            <div>
              <Label htmlFor="sku" className={fieldLabel}>
                SKU
              </Label>
              <Input
                id="sku"
                value={form.sku}
                onChange={(e) => update('sku', e.target.value)}
                placeholder="NK-001"
              />
            </div>
          </div>

          {/* Category + Seller */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="category" className={fieldLabel}>
                Category
              </Label>
              <Select
                value={form.category || undefined}
                onValueChange={(v) => {
                  const picked = categories.find((c) => c.name === v)
                  // Store the display name and link the real Category row.
                  setForm((prev) => ({ ...prev, category: v, categoryId: picked?.id ?? null }))
                }}
              >
                <SelectTrigger id="category" className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {/* Keep the current value selectable when editing a product
                      whose category was removed from the catalog. */}
                  {form.category && !categories.some((c) => c.name === form.category) && (
                    <SelectItem value={form.category}>{form.category}</SelectItem>
                  )}
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
                  {categories.length === 0 && (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      No categories yet — add one first.
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="seller" className={fieldLabel}>
                Seller
              </Label>
              <Input
                id="seller"
                value={form.seller}
                onChange={(e) => update('seller', e.target.value)}
                placeholder="Ali Store"
              />
            </div>
          </div>

          {/* Price + Stock */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="price" className={fieldLabel}>
                Price
              </Label>
              <Input
                id="price"
                type="number"
                min={0}
                step="0.01"
                value={form.price}
                onChange={(e) => update('price', e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="stock" className={fieldLabel}>
                Stock
              </Label>
              <Input
                id="stock"
                type="number"
                min={0}
                value={form.stock}
                onChange={(e) => update('stock', e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <Label className={fieldLabel}>Status</Label>
            <div className="inline-flex rounded-lg border border-input p-0.5">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => update('status', opt.value)}
                  className={cn(
                    'rounded-md px-3 py-1 text-sm font-medium transition-colors',
                    form.status === opt.value
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className={fieldLabel}>
              Description
            </Label>
            <textarea
              id="description"
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              placeholder="Describe the product…"
              rows={4}
              className="w-full resize-none rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">{initial ? 'Update Product' : 'Save Product'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ProductModal
