import type { Metadata } from "next"

import { getProducts } from "@/services/product/product"
import { toNumber } from "@/lib/format"
import { Catalog } from "@/components/shop/catalog"
import type { StoreProduct } from "@/components/shop/product-card"

export const metadata: Metadata = {
  title: "Shop — Your Store",
  description: "Browse shoes, clothing, and accessories. Fast, tracked delivery.",
}

// Always reflect the latest catalog/stock from the database.
export const dynamic = "force-dynamic"

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category: initialCategory } = await searchParams
  const products = await getProducts()

  // Only surface products that are live for shoppers.
  const storeProducts: StoreProduct[] = products
    .filter((p) => p.status === "Active")
    .map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      picture: p.picture,
      category: p.category || p.categoryRel?.name || "Uncategorized",
      stock: toNumber(p.stock),
    }))

  const categories = Array.from(
    new Set(storeProducts.map((p) => p.category))
  ).sort()

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Shop</h1>
        <p className="mt-2 text-muted-foreground">
          {storeProducts.length} products ready to ship.
        </p>
      </div>

      {storeProducts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-20 text-center text-muted-foreground">
          No products are available yet. Please check back soon.
        </div>
      ) : (
        <Catalog
          products={storeProducts}
          categories={categories}
          initialCategory={initialCategory}
        />
      )}
    </div>
  )
}
