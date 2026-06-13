"use client"

import Link from "next/link"
import { Plus } from "lucide-react"

import { formatPrice } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useCart } from "@/components/shop/cart-provider"

export type StoreProduct = {
  id: number
  name: string
  price: string
  picture: string
  category: string
  stock: number
}

const isImageSrc = (s: string) => /^(data:image\/|https?:\/\/|\/)/.test(s)

export function ProductCard({ product }: { product: StoreProduct }) {
  const { add } = useCart()
  const soldOut = product.stock <= 0

  return (
    <Card className="group gap-0 p-0">
      <Link href={`/shop/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {product.picture && isImageSrc(product.picture) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.picture}
              alt={product.name}
              className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="grid size-full place-items-center text-4xl">
              {product.picture || "📦"}
            </div>
          )}
          {soldOut && (
            <div className="absolute inset-0 grid place-items-center bg-background/60 text-sm font-medium">
              Sold out
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="text-xs text-muted-foreground">{product.category}</div>
        <Link
          href={`/shop/${product.id}`}
          className="mt-0.5 line-clamp-1 font-medium hover:underline"
        >
          {product.name}
        </Link>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="font-semibold">{formatPrice(product.price)}</span>
          <Button
            size="icon-sm"
            disabled={soldOut}
            aria-label={`Add ${product.name} to cart`}
            onClick={() =>
              add({
                productId: product.id,
                name: product.name,
                price: product.price,
                picture: product.picture,
                variant: "",
              })
            }
          >
            <Plus />
          </Button>
        </div>
      </div>
    </Card>
  )
}
