"use client"

import * as React from "react"
import { Search } from "lucide-react"

import { Input } from "@/components/input"
import { ProductCard, type StoreProduct } from "@/components/shop/product-card"

export function Catalog({
  products,
  categories,
}: {
  products: StoreProduct[]
  categories: string[]
}) {
  const [query, setQuery] = React.useState("")
  const [category, setCategory] = React.useState<string>("all")

  const filtered = products.filter((p) => {
    const matchesCategory = category === "all" || p.category === category
    const matchesQuery =
      !query.trim() ||
      p.name.toLowerCase().includes(query.trim().toLowerCase()) ||
      p.category.toLowerCase().includes(query.trim().toLowerCase())
    return matchesCategory && matchesQuery
  })

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            className="h-9 pl-8"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <CategoryChip
            label="All"
            active={category === "all"}
            onClick={() => setCategory("all")}
          />
          {categories.map((c) => (
            <CategoryChip
              key={c}
              label={c}
              active={category === c}
              onClick={() => setCategory(c)}
            />
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="mt-16 text-center text-muted-foreground">
          No products match your search.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  )
}

function CategoryChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "rounded-full bg-primary px-3 py-1 text-sm font-medium text-primary-foreground"
          : "rounded-full border border-border px-3 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      }
    >
      {label}
    </button>
  )
}
