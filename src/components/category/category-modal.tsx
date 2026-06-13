'use client'

import { useEffect, useRef, useState } from 'react'
import { ImagePlus, Plus, Upload, X } from 'lucide-react'
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
import { cn } from '@/lib/utils'
import { fileToDataUrl, isImageSrc } from '@/lib/image'
import type { CategoryStatus } from '@/app/admin/categories/data'

export type NewCategory = {
  image: string
  name: string
  slug: string
  status: CategoryStatus
  description: string
}

type SubcategoryDraft = {
  id: number
  image: string
  name: string
  slug: string
  status: CategoryStatus
  description: string
}

// A subcategory draft without the local-only `id`, passed up on save.
export type NewSubcategoryDraft = Omit<SubcategoryDraft, 'id'>

const STATUS_OPTIONS: { value: CategoryStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

const EMPTY: NewCategory = {
  image: '',
  name: '',
  slug: '',
  status: 'active',
  description: '',
}

type CategoryModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: (category: NewCategory, subcategories: NewSubcategoryDraft[]) => void
  // When set, the modal is in edit mode and pre-fills with this category.
  initial?: NewCategory | null
}

const fieldLabel = 'mb-1.5 text-muted-foreground'

const CategoryModal = ({ open, onOpenChange, onSave, initial }: CategoryModalProps) => {
  const [form, setForm] = useState<NewCategory>(EMPTY)
  const [preview, setPreview] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [subcategories, setSubcategories] = useState<SubcategoryDraft[]>([])
  const subIdRef = useRef(0)
  const fileRef = useRef<HTMLInputElement>(null)

  // Sync on open: edit -> prefill category fields; drafts always start empty.
  useEffect(() => {
    if (open) {
      setForm(initial ?? EMPTY)
      // Show the existing image when editing a category that already has one.
      setPreview(initial && isImageSrc(initial.image) ? initial.image : null)
      setSubcategories([])
    }
  }, [open, initial])

  function update<K extends keyof NewCategory>(key: K, value: NewCategory[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function addSubcategory() {
    subIdRef.current += 1
    setSubcategories((prev) => [
      ...prev,
      {
        id: subIdRef.current,
        image: '',
        name: '',
        slug: '',
        status: 'active',
        description: '',
      },
    ])
  }

  function updateSubcategory(id: number, patch: Partial<SubcategoryDraft>) {
    setSubcategories((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch } : s))
    )
  }

  function removeSubcategory(id: number) {
    setSubcategories((prev) => prev.filter((s) => s.id !== id))
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
    setSubcategories([])
  }

  function handleSubmit() {
    const drafts = subcategories.map(({ id: _id, ...rest }) => rest)
    onSave?.(form, drafts)
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
      <DialogContent
        className="grid-rows-[auto_minmax(0,1fr)] max-h-[85vh] sm:max-w-xl"
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle className="text-lg">
            {initial ? 'Edit Category' : 'Add New Category'}
          </DialogTitle>
          <DialogDescription>
            {initial ? 'Update this category' : 'Create a new category'}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmit()
          }}
          className="flex min-h-0 flex-col gap-4"
        >
          <div className="-mr-2 grid min-h-0 flex-1 gap-4 overflow-y-auto pr-2">
          {/* Category Image */}
          <div>
            <Label className={fieldLabel}>
              <ImagePlus className="size-4" />
              Category Image
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
                  alt="Category preview"
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
              <Label htmlFor="cat-name" className={fieldLabel}>
                Category Name
              </Label>
              <Input
                id="cat-name"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="Shoes"
                required
              />
            </div>
            <div>
              <Label htmlFor="cat-slug" className={fieldLabel}>
                Slug
              </Label>
              <Input
                id="cat-slug"
                value={form.slug}
                onChange={(e) => update('slug', e.target.value)}
                placeholder="shoes"
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
            <Label htmlFor="cat-description" className={fieldLabel}>
              Description
            </Label>
            <textarea
              id="cat-description"
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              placeholder="Describe the category…"
              rows={4}
              className="w-full resize-none rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
            />
          </div>

          {/* Subcategories */}
          <div className="grid gap-3">
            {subcategories.map((sub, i) => (
              <SubcategoryCard
                key={sub.id}
                sub={sub}
                index={i}
                onChange={(patch) => updateSubcategory(sub.id, patch)}
                onRemove={() => removeSubcategory(sub.id)}
              />
            ))}

            <Button
              type="button"
              variant="outline"
              className="w-full border-dashed"
              onClick={addSubcategory}
            >
              <Plus className="size-4" />
              Add Subcategories
            </Button>
          </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">{initial ? 'Update Category' : 'Save Category'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

type SubcategoryCardProps = {
  sub: SubcategoryDraft
  index: number
  onChange: (patch: Partial<SubcategoryDraft>) => void
  onRemove: () => void
}

const SubcategoryCard = ({ sub, index, onChange, onRemove }: SubcategoryCardProps) => {
  const [preview, setPreview] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File | undefined) {
    if (!file || !file.type.startsWith('image/')) return
    try {
      const dataUrl = await fileToDataUrl(file)
      setPreview(dataUrl)
      onChange({ image: dataUrl })
    } catch {
      // Ignore unreadable files.
    }
  }

  return (
    <div className="relative grid gap-4 rounded-lg border border-input p-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          Subcategory {index + 1}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onRemove}
          aria-label="Remove subcategory"
        >
          <X />
        </Button>
      </div>

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
                onChange({ image: '' })
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
          <Label htmlFor={`sub-name-${sub.id}`} className={fieldLabel}>
            Subcategory Name
          </Label>
          <Input
            id={`sub-name-${sub.id}`}
            value={sub.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="Sports Shoes"
          />
        </div>
        <div>
          <Label htmlFor={`sub-slug-${sub.id}`} className={fieldLabel}>
            Slug
          </Label>
          <Input
            id={`sub-slug-${sub.id}`}
            value={sub.slug}
            onChange={(e) => onChange({ slug: e.target.value })}
            placeholder="sports-shoes"
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
              onClick={() => onChange({ status: opt.value })}
              className={cn(
                'rounded-md px-3 py-1 text-sm font-medium transition-colors',
                sub.status === opt.value
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
        <Label htmlFor={`sub-description-${sub.id}`} className={fieldLabel}>
          Description
        </Label>
        <textarea
          id={`sub-description-${sub.id}`}
          value={sub.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Describe the subcategory…"
          rows={3}
          className="w-full resize-none rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
        />
      </div>
    </div>
  )
}

export default CategoryModal
