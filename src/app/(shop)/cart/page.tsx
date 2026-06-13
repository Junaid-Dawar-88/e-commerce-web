import type { Metadata } from "next"

import { CartView } from "@/components/shop/cart-view"

export const metadata: Metadata = {
  title: "Your cart — Your Store",
}

export default function CartPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="mb-8 text-3xl font-bold tracking-tight md:text-4xl">
        Your cart
      </h1>
      <CartView />
    </div>
  )
}
