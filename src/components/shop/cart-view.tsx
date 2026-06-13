"use client"

import Link from "next/link"
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"

import { formatPrice } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useCart } from "@/components/shop/cart-provider"

const isImageSrc = (s: string) => /^(data:image\/|https?:\/\/|\/)/.test(s)

export function CartView() {
  const { items, subtotal, setQty, remove, count } = useCart()

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <div className="grid size-14 place-items-center rounded-full bg-muted text-muted-foreground">
          <ShoppingBag className="size-7" />
        </div>
        <h2 className="text-xl font-semibold">Your cart is empty</h2>
        <p className="max-w-sm text-muted-foreground">
          Browse the shop and add a few things you love.
        </p>
        <Button asChild size="lg" className="mt-2 h-11 px-6 text-base">
          <Link href="/shop">Start shopping</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
      {/* Items */}
      <div className="space-y-4">
        {items.map((item) => (
          <Card
            key={`${item.productId}::${item.variant}`}
            className="flex-row items-center gap-4 p-4"
          >
            <Link
              href={`/shop/${item.productId}`}
              className="size-20 shrink-0 overflow-hidden rounded-lg bg-muted"
            >
              {item.picture && isImageSrc(item.picture) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.picture}
                  alt={item.name}
                  className="size-full object-cover"
                />
              ) : (
                <div className="grid size-full place-items-center text-2xl">
                  {item.picture || "📦"}
                </div>
              )}
            </Link>

            <div className="min-w-0 flex-1">
              <Link
                href={`/shop/${item.productId}`}
                className="line-clamp-1 font-medium hover:underline"
              >
                {item.name}
              </Link>
              {item.variant && (
                <div className="text-sm text-muted-foreground">
                  Size: {item.variant}
                </div>
              )}
              <div className="mt-0.5 text-sm text-muted-foreground">
                {formatPrice(item.price)}
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className="inline-flex items-center rounded-lg border border-border">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Decrease quantity"
                  onClick={() => setQty(item.productId, item.variant, item.qty - 1)}
                >
                  <Minus />
                </Button>
                <span className="w-8 text-center text-sm font-medium">
                  {item.qty}
                </span>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Increase quantity"
                  onClick={() => setQty(item.productId, item.variant, item.qty + 1)}
                >
                  <Plus />
                </Button>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Remove item"
                onClick={() => remove(item.productId, item.variant)}
              >
                <Trash2 />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Summary */}
      <div>
        <Card className="sticky top-24 p-6">
          <h2 className="font-semibold">Order summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">
                Subtotal ({count} {count === 1 ? "item" : "items"})
              </dt>
              <dd className="font-medium">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd className="text-muted-foreground">Calculated at checkout</dd>
            </div>
          </dl>
          <div className="mt-4 flex justify-between border-t border-border/60 pt-4 text-base font-semibold">
            <span>Total</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <Button asChild size="lg" className="mt-6 h-11 w-full text-base">
            <Link href="/checkout">Proceed to checkout</Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="mt-2 w-full">
            <Link href="/shop">Continue shopping</Link>
          </Button>
        </Card>
      </div>
    </div>
  )
}
