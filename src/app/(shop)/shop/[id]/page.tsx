import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronLeft, ShieldCheck, Truck } from "lucide-react"

import { getProduct } from "@/services/product/product"
import { formatPrice, toNumber } from "@/lib/format"
import { Badge } from "@/components/ui/badge"
import { AddToCartPanel } from "@/components/shop/add-to-cart-panel"

const isImageSrc = (s: string) => /^(data:image\/|https?:\/\/|\/)/.test(s)

// Offer sensible size options based on the product category.
function sizeOptionsFor(category: string): string[] {
  const c = category.toLowerCase()
  if (c.includes("shoe") || c.includes("footwear") || c.includes("sneaker")) {
    return ["7", "8", "9", "10", "11", "12"]
  }
  if (
    c.includes("cloth") ||
    c.includes("apparel") ||
    c.includes("shirt") ||
    c.includes("wear") ||
    c.includes("jacket")
  ) {
    return ["XS", "S", "M", "L", "XL"]
  }
  return []
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const product = await getProduct(Number(id))
  if (!product) return { title: "Product not found — Your Store" }
  return {
    title: `${product.name} — Your Store`,
    description: product.description || `Buy ${product.name} at Your Store.`,
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const numericId = Number(id)
  if (!Number.isInteger(numericId)) notFound()

  const product = await getProduct(numericId)
  if (!product || product.status !== "Active") notFound()

  const category = product.category || product.categoryRel?.name || "Uncategorized"
  const stock = toNumber(product.stock)
  const soldOut = stock <= 0
  const sizeOptions = sizeOptionsFor(category)

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <Link
        href="/shop"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Back to shop
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        {/* Image */}
        <div className="overflow-hidden rounded-2xl border border-border bg-muted">
          <div className="aspect-square">
            {product.picture && isImageSrc(product.picture) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.picture}
                alt={product.name}
                className="size-full object-cover"
              />
            ) : (
              <div className="grid size-full place-items-center text-6xl">
                {product.picture || "📦"}
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div>
          <div className="text-sm text-muted-foreground">{category}</div>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            {product.name}
          </h1>

          <div className="mt-4 flex items-center gap-3">
            <span className="text-2xl font-semibold">
              {formatPrice(product.price)}
            </span>
            {soldOut ? (
              <Badge variant="destructive">Sold out</Badge>
            ) : (
              <Badge variant="secondary">In stock</Badge>
            )}
          </div>

          {product.description && (
            <p className="mt-5 text-pretty text-muted-foreground">
              {product.description}
            </p>
          )}

          <div className="mt-8">
            {soldOut ? (
              <div className="rounded-xl border border-dashed border-border p-6 text-center text-muted-foreground">
                This product is currently sold out.
              </div>
            ) : (
              <AddToCartPanel
                product={{
                  productId: product.id,
                  name: product.name,
                  price: product.price,
                  picture: product.picture,
                }}
                sizeOptions={sizeOptions}
              />
            )}
          </div>

          {/* Reassurance */}
          <div className="mt-8 grid gap-3 border-t border-border/60 pt-6 text-sm text-muted-foreground sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <Truck className="size-4" />
              Fast, tracked delivery
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4" />
              Hassle-free returns
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
