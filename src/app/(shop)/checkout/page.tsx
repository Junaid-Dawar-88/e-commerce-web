import type { Metadata } from "next"
import Link from "next/link"

import prisma from "@/lib/prisma"
import { getCurrentUser } from "@/lib/rbac"
import { getSettings } from "@/services/setting/setting"
import { Button } from "@/components/ui/button"
import { CheckoutForm, type PaymentMethod } from "@/components/shop/checkout-form"

export const metadata: Metadata = {
  title: "Checkout — Your Store",
}

export const dynamic = "force-dynamic"

export default async function CheckoutPage() {
  const user = await getCurrentUser()

  // Not signed in → ask them to sign in / create an account first.
  if (!user) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-6 py-24 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Sign in to check out</h1>
        <p className="text-muted-foreground">
          Create an account or sign in so we can save your order and let you
          track it.
        </p>
        <div className="mt-2 flex gap-3">
          <Button asChild size="lg" className="h-11 px-6 text-base">
            <Link href="/login?callbackUrl=/checkout">Sign in</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-11 px-6 text-base">
            <Link href="/register?callbackUrl=/checkout">Create account</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Staff/admin accounts aren't shoppers — orders are placed against a
  // customer account. Point them to the admin order tools instead.
  if (user.role !== "user") {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-6 py-24 text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          Checkout is for customer accounts
        </h1>
        <p className="text-muted-foreground">
          You&apos;re signed in as a team member. To place an order for a
          customer, use the admin order tools.
        </p>
        <Button asChild size="lg" className="mt-2 h-11 px-6 text-base">
          <Link href="/admin/order">Go to orders</Link>
        </Button>
      </div>
    )
  }

  // Prefill from the customer's saved profile.
  const customer = await prisma.customer.findUnique({
    where: { id: user.id },
    select: { name: true, email: true, phone: true, city: true, state: true, country: true },
  })

  const address = [customer?.city, customer?.state, customer?.country]
    .filter(Boolean)
    .join(", ")

  // Build the manual transfer methods from store settings — only ones that are
  // enabled and have an account number / IBAN filled in show up at checkout.
  const { manualPayments: mp, delivery } = await getSettings()
  const clean = (rows: { label: string; value: string }[]) =>
    rows.filter((r) => r.value.trim())

  const methods: PaymentMethod[] = []
  if (mp.jazzcash.enabled && mp.jazzcash.number.trim()) {
    methods.push({
      key: "jazzcash",
      label: "JazzCash",
      details: clean([
        { label: "Account title", value: mp.jazzcash.title },
        { label: "JazzCash number", value: mp.jazzcash.number },
      ]),
    })
  }
  if (mp.easypaisa.enabled && mp.easypaisa.number.trim()) {
    methods.push({
      key: "easypaisa",
      label: "Easypaisa",
      details: clean([
        { label: "Account title", value: mp.easypaisa.title },
        { label: "Easypaisa number", value: mp.easypaisa.number },
      ]),
    })
  }
  if (mp.sadapay.enabled && mp.sadapay.iban.trim()) {
    methods.push({
      key: "sadapay",
      label: "SadaPay",
      details: clean([
        { label: "Account title", value: mp.sadapay.title },
        { label: "IBAN", value: mp.sadapay.iban },
      ]),
    })
  }
  if (mp.bank.enabled && (mp.bank.iban.trim() || mp.bank.number.trim())) {
    methods.push({
      key: "bank",
      label: mp.bank.bankName ? `Bank Transfer · ${mp.bank.bankName}` : "Bank Transfer",
      details: clean([
        { label: "Bank", value: mp.bank.bankName },
        { label: "Account title", value: mp.bank.title },
        { label: "Account number", value: mp.bank.number },
        { label: "IBAN", value: mp.bank.iban },
      ]),
    })
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="mb-8 text-3xl font-bold tracking-tight md:text-4xl">
        Checkout
      </h1>
      <CheckoutForm
        defaults={{
          name: customer?.name ?? user.name ?? "",
          email: customer?.email ?? user.email ?? "",
          phone: customer?.phone ?? "",
          address,
        }}
        methods={methods}
        delivery={{
          enabled: delivery.enabled,
          fee: Number(delivery.fee) || 0,
          freeOver: Number(delivery.freeOver) || 0,
        }}
      />
    </div>
  )
}
