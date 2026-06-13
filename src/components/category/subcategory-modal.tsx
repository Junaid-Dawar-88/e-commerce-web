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
import { fileToDataUrl, isImageSrc } from '@/lib/image'
import { type CategoryStatus } from '@/app/admin/categories/data'

export type NewSubcategory = {
  image: string
  name: string
  slug: string
  categoryId: number
  status: CategoryStatus
  description: string
}

const STATUS_OPTIONS: { value: CategoryStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

const EMPTY: NewSubcategory = {
  image: '',
  name: '',
  slug: '',
  categoryId: 0,
  status: 'active',
  description: '',
}

type SubcategoryModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: (subcategory: NewSubcategory) => void
  // Parent categories for the dropdown.
  categories: { id: string; name: string }[]
  // When set, the modal is in edit mode and pre-fills with this subcategory.
  initial?: NewSubcategory | null
  // Preselected parent when adding (not editing).
  defaultCategoryId?: number
}

const fieldLabel = 'mb-1.5 text-muted-foreground'

const SubcategoryModal = ({
  open,
  onOpenChange,
  onSave,
  categories,
  initial,
  defaultCategoryId,
}: SubcategoryModalProps) => {
  const [form, setForm] = useState<NewSubcategory>(EMPTY)
  const [preview, setPreview] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setForm(initial ?? { ...EMPTY, categoryId: defaultCategoryId ?? 0 })
      // Show the existing image when editing a subcategory that already has one.
      setPreview(initial && isImageSrc(initial.image) ? initial.image : null)
    }
  }, [open, initial, defaultCategoryId])

  function update<K extends keyof NewSubcategory>(key: K, value: NewSubcategory[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleFile(file: File | undefined) {
    if (!file || !file.type.startsWith('image/')) return
    try {
      const dataUrl = await fileToDataUrl(file)
      setPreview(dataUrl)
      update('image', dataUrl)
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
            {initial ? 'Edit Subcategory' : 'Add New Subcategory'}
          </DialogTitle>
          <DialogDescription>
            {initial ? 'Update this subcategory' : 'Create a new subcategory'}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmit()
          }}
          className="grid gap-4"
        >
          {/* Subcategory Image */}
          <div>
            <Label className={fieldLabel}>
              <ImagePlus className="size-4" />
              Subcategory Image
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
                  alt="Subcategory preview"
                  className="h-40 w-full object-cover"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setPreview(null)
                    update('image', '')
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
                <span className="text-sm font-medium">Upload image</span>
                <span className="text-xs">or drag &amp; drop it here</span>
              </button>
            )}
          </div>

          {/* Name + Slug */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="sub-name" className={fieldLabel}>
                Subcategory Name
              </Label>
              <Input
                id="sub-name"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="Sports Shoes"
                required
              />
            </div>
            <div>
              <Label htmlFor="sub-slug" className={fieldLabel}>
                Slug
              </Label>
              <Input
                id="sub-slug"
                value={form.slug}
                onChange={(e) => update('slug', e.target.value)}
                placeholder="sports-shoes"
              />
            </div>
          </div>

          {/* Parent Category + Status */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="sub-parent" className={fieldLabel}>
                Parent Category
              </Label>
              <Select
                value={form.categoryId ? String(form.categoryId) : ''}
                onValueChange={(v) => update('categoryId', Number(v))}
              >
                <SelectTrigger id="sub-parent" className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="sub-description" className={fieldLabel}>
              Description
            </Label>
            <textarea
              id="sub-description"
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              placeholder="Describe the subcategory…"
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
            <Button type="submit">{initial ? 'Update Subcategory' : 'Save Subcategory'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default SubcategoryModal
