'use client'

import { Fragment, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Search,
  Plus,
  ChevronRight,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  FolderTree,
  Layers,
  Package,
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
import { isImageSrc } from '@/lib/image'
import {
  categories as seedCategories,
  mapCategory,
  mapSubcategory,
  type Category,
  type CategoryStatus,
  type Subcategory,
} from '@/app/admin/categories/data'
import {
  addCategory,
  addSubcategory,
  deleteCategory as apiDeleteCategory,
  deleteSubcategory as apiDeleteSubcategory,
  getCategories,
  updateCategory,
  updateSubcategory,
} from '@/app/api/category-helper/category-helper'
import CategoryModal, { type NewCategory, type NewSubcategoryDraft } from './category-modal'
import SubcategoryModal, { type NewSubcategory } from './subcategory-modal'

const statusMeta: Record<CategoryStatus, { label: string; className: string }> = {
  active: { label: 'Active', className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  inactive: { label: 'Inactive', className: 'bg-muted text-muted-foreground' },
}

function StatTile({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string
  value: number
  icon: LucideIcon
  accent: string
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
        <p className="text-2xl font-semibold tracking-tight tabular-nums">
          {value.toLocaleString()}
        </p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

export function CategoriesView({ className }: { className?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [items, setItems] = useState<Category[]>(seedCategories)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<CategoryStatus | 'all'>('all')
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['c1']))
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [subcategoryModalOpen, setSubcategoryModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editingSub, setEditingSub] = useState<{ sub: Subcategory; categoryId: string } | null>(null)
  const [subParentId, setSubParentId] = useState<string | null>(null)

  useEffect(() => {
    getCategories()
      .then((rows) => setItems(rows.map(mapCategory)))
      .catch(() => {
        // Leave the tree empty if the API is unavailable.
      })
  }, [])

  // Support deep-linking to edit a category, e.g. /admin/categories?edit=3
  // (used by the "Edit" button on the category detail page).
  const editId = searchParams.get('edit')
  useEffect(() => {
    if (!editId) return
    const target = items.find((c) => c.id === editId)
    if (target) {
      setEditingCategory(target)
      setCategoryModalOpen(true)
    }
  }, [editId, items])

  const openView = (id: string) => router.push(`/admin/categories/${id}`)

  const q = query.trim().toLowerCase()
  const searching = q.length > 0

  const stats = useMemo(() => {
    const subs = items.reduce((sum, c) => sum + c.subcategories.length, 0)
    const products = items.reduce((sum, c) => sum + c.products, 0)
    return { categories: items.length, subcategories: subs, products }
  }, [items])

  // Filter the tree: keep a category if it (or any of its subs) matches the
  // search + status filter; prune non-matching subs out of the result.
  const filtered = useMemo(() => {
    const statusOk = (s: CategoryStatus) => status === 'all' || s === status
    return items
      .map((cat) => {
        const subs = cat.subcategories.filter(
          (s) => statusOk(s.status) && (!q || s.name.toLowerCase().includes(q))
        )
        const parentMatches = statusOk(cat.status) && (!q || cat.name.toLowerCase().includes(q))
        // Show all subs when the parent itself matched; otherwise only matching subs.
        const visibleSubs = parentMatches && !q ? cat.subcategories.filter((s) => statusOk(s.status)) : subs
        return { cat, visibleSubs, keep: parentMatches || subs.length > 0 }
      })
      .filter((row) => row.keep)
  }, [items, q, status])

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  async function removeCategory(id: string) {
    await apiDeleteCategory(Number(id))
    setItems((prev) => prev.filter((c) => c.id !== id))
  }

  async function removeSub(catId: string, subId: string) {
    await apiDeleteSubcategory(Number(subId))
    setItems((prev) =>
      prev.map((c) =>
        c.id === catId
          ? { ...c, subcategories: c.subcategories.filter((s) => s.id !== subId) }
          : c
      )
    )
  }

  function openAddCategory() {
    setEditingCategory(null)
    setCategoryModalOpen(true)
  }

  function openEditCategory(cat: Category) {
    setEditingCategory(cat)
    setCategoryModalOpen(true)
  }

  function openAddSub(cat: Category) {
    setEditingSub(null)
    setSubParentId(cat.id)
    setSubcategoryModalOpen(true)
  }

  function openEditSub(cat: Category, sub: Subcategory) {
    setEditingSub({ sub, categoryId: cat.id })
    setSubParentId(cat.id)
    setSubcategoryModalOpen(true)
  }

  async function handleSaveCategory(form: NewCategory, drafts: NewSubcategoryDraft[]) {
    if (editingCategory?.id) {
      const row = await updateCategory(Number(editingCategory.id), form)
      // `updateCategory` doesn't return subcategories — keep the existing ones,
      // then append any newly added drafts.
      const created: Subcategory[] = []
      for (const draft of drafts) {
        const subRow = await addSubcategory({ ...draft, categoryId: Number(editingCategory.id) })
        created.push(mapSubcategory(subRow))
      }
      setItems((prev) =>
        prev.map((c) =>
          c.id === editingCategory.id
            ? { ...mapCategory(row), subcategories: [...editingCategory.subcategories, ...created] }
            : c
        )
      )
    } else {
      const row = await addCategory(form)
      const created: Subcategory[] = []
      for (const draft of drafts) {
        const subRow = await addSubcategory({ ...draft, categoryId: Number(row.id) })
        created.push(mapSubcategory(subRow))
      }
      setItems((prev) => [{ ...mapCategory(row), subcategories: created }, ...prev])
    }
  }

  async function handleSaveSub(form: NewSubcategory) {
    const targetCat = String(form.categoryId)
    if (editingSub?.sub.id) {
      const row = await updateSubcategory(Number(editingSub.sub.id), form)
      const mapped = mapSubcategory(row)
      setItems((prev) =>
        prev.map((c) => {
          const without = c.subcategories.filter((s) => s.id !== mapped.id)
          return c.id === targetCat
            ? { ...c, subcategories: [...without, mapped] }
            : { ...c, subcategories: without }
        })
      )
    } else {
      const row = await addSubcategory(form)
      const mapped = mapSubcategory(row)
      setItems((prev) =>
        prev.map((c) =>
          c.id === targetCat ? { ...c, subcategories: [...c.subcategories, mapped] } : c
        )
      )
    }
  }

  const editSubInitial: NewSubcategory | null = editingSub
    ? {
        image: editingSub.sub.image,
        name: editingSub.sub.name,
        slug: editingSub.sub.slug,
        description: editingSub.sub.description,
        status: editingSub.sub.status,
        categoryId: Number(editingSub.categoryId),
      }
    : null

  return (
    <div className={cn('flex h-full flex-col gap-6', className)}>
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
          <p className="text-sm text-muted-foreground">
            Organize your catalog into categories and subcategories.
          </p>
        </div>
        <Button onClick={openAddCategory}>
          <Plus className="size-4" />
          Add New
        </Button>
      </header>

      {/* Stat tiles */}
      <div className="grid shrink-0 grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label="Categories" value={stats.categories} icon={FolderTree} accent="oklch(0.55 0.22 264)" />
        <StatTile label="Subcategories" value={stats.subcategories} icon={Layers} accent="oklch(0.7 0.14 195)" />
        <StatTile label="Products" value={stats.products} icon={Package} accent="oklch(0.77 0.16 70)" />
      </div>

      {/* Table card */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
        {/* Toolbar (fixed) */}
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b p-4">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search category…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-9 pl-8"
            />
          </div>
          <Select value={status} onValueChange={(v) => setStatus(v as CategoryStatus | 'all')}>
            <SelectTrigger size="sm" className="w-[150px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tree (only body scrolls; header pinned) */}
        <Table containerClassName="min-h-0 flex-1 overflow-y-auto">
          <TableHeader className="sticky top-0 z-10 bg-card [&_th]:bg-card [&_tr]:border-b [&_tr]:hover:bg-card">
            <TableRow>
              <TableHead className="pl-4">Category</TableHead>
              <TableHead className="text-right">Products</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12 pr-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(({ cat, visibleSubs }) => {
              const isOpen = searching ? true : expanded.has(cat.id)
              const hasSubs = cat.subcategories.length > 0
              return (
                <Fragment key={cat.id}>
                  {/* Parent row */}
                  <TableRow className="group">
                    <TableCell className="pl-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => hasSubs && toggle(cat.id)}
                          className={cn(
                            'flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors',
                            hasSubs ? 'hover:bg-muted hover:text-foreground' : 'invisible'
                          )}
                          aria-label={isOpen ? 'Collapse' : 'Expand'}
                          aria-expanded={isOpen}
                        >
                          <ChevronRight
                            className={cn('size-4 transition-transform', isOpen && 'rotate-90')}
                          />
                        </button>
                        {cat.image && isImageSrc(cat.image) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={cat.image}
                            alt={cat.name}
                            className="size-9 shrink-0 rounded-lg object-cover ring-1 ring-foreground/10"
                          />
                        ) : (
                          <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-lg">
                            {cat.image}
                          </span>
                        )}
                        <div className="leading-tight">
                          <p className="font-medium">{cat.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {cat.subcategories.length} subcategories
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{cat.products}</TableCell>
                    <TableCell>
                      <Badge className={cn('font-normal', statusMeta[cat.status].className)}>
                        {statusMeta[cat.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-4 text-right">
                      <RowActions
                        onView={() => openView(cat.id)}
                        onAddSub={() => openAddSub(cat)}
                        onEdit={() => openEditCategory(cat)}
                        onDelete={() => removeCategory(cat.id)}
                        label={cat.name}
                      />
                    </TableCell>
                  </TableRow>

                  {/* Child rows */}
                  {isOpen &&
                    visibleSubs.map((sub, i) => (
                      <TableRow key={sub.id} className="bg-muted/30">
                        <TableCell className="py-2 pl-4">
                          <div className="flex items-center gap-2 pl-8">
                            {/* tree guide */}
                            <span className="relative flex h-9 w-5 shrink-0 items-center justify-center">
                              <span
                                className={cn(
                                  'absolute left-1/2 top-0 w-px bg-border',
                                  i === visibleSubs.length - 1 ? 'h-1/2' : 'h-full'
                                )}
                              />
                              <span className="absolute left-1/2 top-1/2 h-px w-2 bg-border" />
                            </span>
                            {sub.image && isImageSrc(sub.image) ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={sub.image}
                                alt={sub.name}
                                className="size-8 shrink-0 rounded-md object-cover ring-1 ring-foreground/10"
                              />
                            ) : (
                              <span className="flex size-8 items-center justify-center rounded-md bg-background text-base ring-1 ring-foreground/10">
                                {sub.image}
                              </span>
                            )}
                            <span className="text-sm">{sub.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-muted-foreground">
                          {sub.products}
                        </TableCell>
                        <TableCell>
                          <Badge className={cn('font-normal', statusMeta[sub.status].className)}>
                            {statusMeta[sub.status].label}
                          </Badge>
                        </TableCell>
                        <TableCell className="pr-4 text-right">
                          <RowActions
                            onEdit={() => openEditSub(cat, sub)}
                            onDelete={() => removeSub(cat.id, sub.id)}
                            label={sub.name}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                </Fragment>
              )
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  No categories found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Footer (fixed) */}
        <div className="shrink-0 border-t px-4 py-3 text-sm text-muted-foreground">
          {stats.categories} categories · {stats.subcategories} subcategories
        </div>
      </div>

      <CategoryModal
        open={categoryModalOpen}
        onOpenChange={(next) => {
          setCategoryModalOpen(next)
          // Drop the ?edit= deep-link param so the modal doesn't reopen.
          if (!next && editId) router.replace('/admin/categories')
        }}
        onSave={handleSaveCategory}
        initial={editingCategory}
      />
      <SubcategoryModal
        open={subcategoryModalOpen}
        onOpenChange={setSubcategoryModalOpen}
        onSave={handleSaveSub}
        categories={items.map((c) => ({ id: c.id, name: c.name }))}
        initial={editSubInitial}
        defaultCategoryId={subParentId ? Number(subParentId) : undefined}
      />
    </div>
  )
}

function RowActions({
  onView,
  onAddSub,
  onEdit,
  onDelete,
  label,
}: {
  onView?: () => void
  onAddSub?: () => void
  onEdit: () => void
  onDelete: () => void
  label: string
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8" aria-label={`Actions for ${label}`}>
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        {onView && (
          <DropdownMenuItem onClick={onView}>
            <Eye className="size-4" />
            View
          </DropdownMenuItem>
        )}
        {onAddSub && (
          <DropdownMenuItem onClick={onAddSub}>
            <Plus className="size-4" />
            Add subcategory
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={onEdit}>
          <Pencil className="size-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={onDelete}>
          <Trash2 className="size-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
