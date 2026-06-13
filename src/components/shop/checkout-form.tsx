"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ShoppingBag } from "lucide-react"

import { formatPrice } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/input"
import { useCart } from "@/components/shop/cart-provider"

type Defaults = {
  name: string
  email: string
  phone: string
  address: string
}

export function CheckoutForm({ defaults }: { defaults: Defaults }) {
  const router = useRouter()
  const { items, subtotal, clear } = useCart()
  const [payment, setPayment] = React.useState<"cod" | "online">("cod")
  const [error, setError] = React.useState<string | null>(null)
  const [pending, setPending] = React.useState(false)

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <div className="grid size-14 place-items-center rounded-full bg-muted text-muted-foreground">
          <ShoppingBag className="size-7" />
        </div>
        <h2 className="text-xl font-semibold">Your cart is empty</h2>
        <p className="max-w-sm text-muted-foreground">
          Add something to your cart before checking out.
        </p>
        <Button asChild size="lg" className="mt-2 h-11 px-6 text-base">
          <Link href="/shop">Browse the shop</Link>
        </Button>
      </div>
    )
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setPending(true)

    const form = new FormData(event.currentTarget)
    const name = String(form.get("name") ?? "").trim()
    const phone = String(form.get("phone") ?? "").trim()
    const address = String(form.get("address") ?? "").trim()

    if (!name || !address) {
      setError("Please provide a name and shipping address.")
      setPending(false)
      return
    }

    const shippingAddress = [name, phone, address].filter(Boolean).join(" — ")

    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: subtotal.toFixed(2),
          status: "pending",
          paymentMethod: payment === "cod" ? "Cash on Delivery" : "Online (pay later)",
          paymentStatus: payment === "cod" ? "cod" : "unpaid",
          shippingAddress,
          items: items.map((i) => ({
            productId: i.productId,
            name: i.name,
            variant: i.variant,
            qty: i.qty,
            price: i.price,
          })),
        }),
      })

      if (res.status === 401) {
        router.push("/login?callbackUrl=/checkout")
        return
      }
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error ?? "Could not place your order.")
      }

      clear()
      router.push("/account/orders?placed=1")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
      setPending(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-8 lg:grid-cols-[1.5fr_1fr]"
    >
      {/* Shipping + payment */}
      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="font-semibold">Shipping details</h2>
          <div className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" name="name" defaultValue={defaults.name} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" defaultValue={defaults.phone} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={defaults.email}
                readOnly
                className="text-muted-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Shipping address</Label>
              <textarea
                id="address"
                name="address"
                rows={3}
                defaultValue={defaults.address}
                placeholder="Street, city, state, postal code, country"
                required
                className="w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold">Payment method</h2>
          <div className="mt-4 space-y-3">
            <PaymentOption
              label="Cash on Delivery"
              description="Pay with cash when your order arrives."
              checked={payment === "cod"}
              onChange={() => setPayment("cod")}
            />
            <PaymentOption
              label="Online / Card (pay later)"
              description="We'll confirm your order and follow up for payment."
              checked={payment === "online"}
              onChange={() => setPayment("online")}
            />
          </div>
        </Card>
      </div>

      {/* Summary */}
      <div>
        <Card className="sticky top-24 p-6">
          <h2 className="font-semibold">Order summary</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {items.map((item) => (
              <li
                key={`${item.productId}::${item.variant}`}
                className="flex justify-between gap-3"
              >
                <span className="min-w-0">
                  <span className="line-clamp-1">{item.name}</span>
                  <span className="text-muted-foreground">
                    {item.variant ? `Size ${item.variant} · ` : ""}Qty {item.qty}
                  </span>
                </span>
                <span className="shrink-0 font-medium">
                  {formatPrice(Number(item.price) * item.qty)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-border/60 pt-4 text-base font-semibold">
            <span>Total</span>
            <span>{formatPrice(subtotal)}</span>
          </div>

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={pending}
            className="mt-6 h-11 w-full text-base"
          >
            {pending ? "Placing order…" : "Place order"}
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Your order goes straight to our team to process.
          </p>
        </Card>
      </div>
    </form>
  )
}

function PaymentOption({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <label
      className={
        checked
          ? "flex cursor-pointer items-start gap-3 rounded-lg border border-primary bg-primary/5 p-3"
          : "flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 transition-colors hover:border-foreground/30"
      }
    >
      <input
        type="radio"
        name="payment"
        checked={checked}
        onChange={onChange}
        className="mt-1 accent-[var(--primary)]"
      />
      <span>
        <span className="block text-sm font-medium">{label}</span>
        <span className="block text-sm text-muted-foreground">{description}</span>
      </span>
    </label>
  )
}
