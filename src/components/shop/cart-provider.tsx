"use client"

import * as React from "react"

import { toNumber } from "@/lib/format"

export type CartItem = {
  productId: number
  name: string
  price: string
  picture: string
  // Size / colour etc. Empty when the product has no variant.
  variant: string
  qty: number
}

type CartContextValue = {
  items: CartItem[]
  count: number
  subtotal: number
  // Add (or increment) a line. Lines are keyed by productId + variant.
  add: (item: Omit<CartItem, "qty">, qty?: number) => void
  setQty: (productId: number, variant: string, qty: number) => void
  remove: (productId: number, variant: string) => void
  clear: () => void
}

const CartContext = React.createContext<CartContextValue | null>(null)

const STORAGE_KEY = "store.cart.v1"

const lineKey = (productId: number, variant: string) => `${productId}::${variant}`

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CartItem[]>([])
  const [hydrated, setHydrated] = React.useState(false)

  // Load once on mount (client only).
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setItems(JSON.parse(raw) as CartItem[])
    } catch {
      // Corrupt storage — start empty.
    }
    setHydrated(true)
  }, [])

  // Persist on change (after the initial load so we don't clobber storage).
  React.useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Storage full / unavailable — ignore.
    }
  }, [items, hydrated])

  const add = React.useCallback<CartContextValue["add"]>((item, qty = 1) => {
    setItems((prev) => {
      const key = lineKey(item.productId, item.variant)
      const existing = prev.find(
        (i) => lineKey(i.productId, i.variant) === key
      )
      if (existing) {
        return prev.map((i) =>
          lineKey(i.productId, i.variant) === key
            ? { ...i, qty: i.qty + qty }
            : i
        )
      }
      return [...prev, { ...item, qty }]
    })
  }, [])

  const setQty = React.useCallback<CartContextValue["setQty"]>(
    (productId, variant, qty) => {
      setItems((prev) =>
        prev
          .map((i) =>
            lineKey(i.productId, i.variant) === lineKey(productId, variant)
              ? { ...i, qty: Math.max(0, qty) }
              : i
          )
          .filter((i) => i.qty > 0)
      )
    },
    []
  )

  const remove = React.useCallback<CartContextValue["remove"]>(
    (productId, variant) => {
      setItems((prev) =>
        prev.filter(
          (i) => lineKey(i.productId, i.variant) !== lineKey(productId, variant)
        )
      )
    },
    []
  )

  const clear = React.useCallback(() => setItems([]), [])

  const count = items.reduce((sum, i) => sum + i.qty, 0)
  const subtotal = items.reduce((sum, i) => sum + toNumber(i.price) * i.qty, 0)

  const value: CartContextValue = {
    items,
    count,
    subtotal,
    add,
    setQty,
    remove,
    clear,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = React.useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within a CartProvider")
  return ctx
}
