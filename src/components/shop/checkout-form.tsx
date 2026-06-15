"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ShoppingBag, Upload } from "lucide-react"

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

// A manual bank/wallet transfer method, configured in admin Settings.
export type PaymentMethod = {
  key: string
  label: string
  details: { label: string; value: string }[]
}

// Read a file and downscale it (max 1200px wide, JPEG) so the payment-proof
// screenshot stored on the order stays small.
async function fileToCompressedDataUrl(file: File): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
  return await new Promise<string>((resolve) => {
    const img = new window.Image()
    img.onload = () => {
      const maxW = 1200
      const scale = Math.min(1, maxW / img.width)
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      const canvas = document.createElement("canvas")
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext("2d")
      if (!ctx) return resolve(dataUrl)
      ctx.drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL("image/jpeg", 0.8))
    }
    img.onerror = () => resolve(dataUrl)
    img.src = dataUrl
  })
}

type Delivery = { enabled: boolean; fee: number; freeOver: number }

export function CheckoutForm({
  defaults,
  methods = [],
  delivery,
}: {
  defaults: Defaults
  methods?: PaymentMethod[]
  delivery?: Delivery
}) {
  const router = useRouter()
  const { items, subtotal, clear } = useCart()
  // "cod" or one of the manual method keys.
  const [payment, setPayment] = React.useState<string>("cod")
  const [tid, setTid] = React.useState("")
  const [proof, setProof] = React.useState("")
  const [proofName, setProofName] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [pending, setPending] = React.useState(false)

  const selectedMethod = methods.find((m) => m.key === payment) ?? null

  async function handleProof(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file.")
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("That image is too large (max 10MB).")
      return
    }
    setError(null)
    setProofName(file.name)
    setProof(await fileToCompressedDataUrl(file))
  }

  // Delivery is free once the subtotal reaches `freeOver` (when > 0).
  const deliveryFee =
    delivery?.enabled && !(delivery.freeOver > 0 && subtotal >= delivery.freeOver)
      ? delivery.fee
      : 0
  const total = subtotal + deliveryFee

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

    // Manual transfer methods require the Transaction ID and a screenshot
    // so staff can verify the payment.
    const ref = tid.trim()
    if (selectedMethod && !ref) {
      setError("Please enter the Transaction ID from your transfer.")
      setPending(false)
      return
    }
    if (selectedMethod && !proof) {
      setError("Please upload a screenshot of your transfer.")
      setPending(false)
      return
    }

    const shippingAddress = [name, phone, address].filter(Boolean).join(" — ")

    const paymentMethod = selectedMethod
      ? `${selectedMethod.label} · TID: ${ref}`
      : "Cash on Delivery"
    const paymentStatus = selectedMethod ? "unpaid" : "cod"

    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: total.toFixed(2),
          status: "pending",
          paymentMethod,
          paymentStatus,
          shippingAddress,
          paymentProof: selectedMethod ? proof : "",
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

            {methods.map((m) => (
              <PaymentOption
                key={m.key}
                label={m.label}
                description="Transfer the total, then enter your Transaction ID below."
                checked={payment === m.key}
                onChange={() => setPayment(m.key)}
              />
            ))}
          </div>

          {/* Account details + Transaction ID for the selected transfer method */}
          {selectedMethod && (
            <div className="mt-4 space-y-4 rounded-lg border border-border bg-muted/40 p-4">
              <div>
                <p className="text-sm font-medium">
                  Send {formatPrice(total)} to this {selectedMethod.label} account
                </p>
                <dl className="mt-3 space-y-2 text-sm">
                  {selectedMethod.details.map((d) => (
                    <div key={d.label} className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">{d.label}</dt>
                      <dd className="font-medium tabular-nums">{d.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tid">Transaction ID (TID)</Label>
                <Input
                  id="tid"
                  name="tid"
                  value={tid}
                  onChange={(e) => setTid(e.target.value)}
                  placeholder="e.g. 1234567890"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  After transferring, paste the Transaction ID from your payment
                  receipt. We&apos;ll verify it and confirm your order.
                </p>
              </div>

              {/* Required payment screenshot */}
              <div className="space-y-2">
                <Label htmlFor="proof">Payment screenshot</Label>
                <input
                  id="proof"
                  type="file"
                  accept="image/*"
                  onChange={handleProof}
                  className="hidden"
                />
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("proof")?.click()}
                  >
                    <Upload className="size-4" />
                    {proof ? "Change screenshot" : "Upload screenshot"}
                  </Button>
                  {proofName && (
                    <span className="min-w-0 truncate text-xs text-muted-foreground">
                      {proofName}
                    </span>
                  )}
                </div>
                {proof && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={proof}
                    alt="Payment screenshot preview"
                    className="mt-2 max-h-48 rounded-lg border border-border object-contain"
                  />
                )}
                <p className="text-xs text-muted-foreground">
                  Required — attach a screenshot of your transfer so we can verify
                  and confirm your order.
                </p>
              </div>
            </div>
          )}
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
          <div className="mt-4 space-y-2 border-t border-border/60 pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {delivery?.enabled && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span>{deliveryFee === 0 ? "Free" : formatPrice(deliveryFee)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-border/60 pt-2 text-base font-semibold">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
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
        className="mt-1 accent-primary"
      />
      <span>
        <span className="block text-sm font-medium">{label}</span>
        <span className="block text-sm text-muted-foreground">{description}</span>
      </span>
    </label>
  )
}
