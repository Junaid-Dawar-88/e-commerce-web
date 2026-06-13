"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Check, Minus, Plus, ShoppingCart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useCart, type CartItem } from "@/components/shop/cart-provider"

export function AddToCartPanel({
  product,
  sizeOptions,
}: {
  product: Omit<CartItem, "qty" | "variant">
  sizeOptions: string[]
}) {
  const router = useRouter()
  const { add } = useCart()
  const [size, setSize] = React.useState<string>("")
  const [qty, setQty] = React.useState(1)
  const [added, setAdded] = React.useState(false)
  const [needsSize, setNeedsSize] = React.useState(false)

  const hasSizes = sizeOptions.length > 0

  function handleAdd(thenGoToCart = false) {
    if (hasSizes && !size) {
      setNeedsSize(true)
      return
    }
    add({ ...product, variant: size }, qty)
    if (thenGoToCart) {
      router.push("/cart")
      return
    }
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div className="space-y-6">
      {hasSizes && (
        <div>
          <div className="mb-2 text-sm font-medium">
            Size
            {needsSize && !size && (
              <span className="ml-2 text-destructive">Please select a size</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {sizeOptions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setSize(s)
                  setNeedsSize(false)
                }}
                className={
                  size === s
                    ? "min-w-10 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
                    : "min-w-10 rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:border-foreground/30"
                }
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="mb-2 text-sm font-medium">Quantity</div>
        <div className="inline-flex items-center rounded-lg border border-border">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Decrease quantity"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
          >
            <Minus />
          </Button>
          <span className="w-10 text-center text-sm font-medium">{qty}</span>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Increase quantity"
            onClick={() => setQty((q) => q + 1)}
          >
            <Plus />
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          size="lg"
          variant="outline"
          className="h-11 flex-1 text-base"
          onClick={() => handleAdd(false)}
        >
          {added ? (
            <>
              <Check data-icon="inline-start" />
              Added
            </>
          ) : (
            <>
              <ShoppingCart data-icon="inline-start" />
              Add to cart
            </>
          )}
        </Button>
        <Button
          size="lg"
          className="h-11 flex-1 text-base"
          onClick={() => handleAdd(true)}
        >
          Buy now
        </Button>
      </div>
    </div>
  )
}
