import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Check, Sparkles } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Pricing — Your Store",
  description:
    "Simple, transparent pricing that scales with your store. Start free, upgrade when you grow.",
}

const plans = [
  {
    name: "Starter",
    price: "$0",
    period: "/mo",
    description: "Everything you need to launch your first store.",
    features: [
      "Up to 50 products",
      "Storefront & checkout",
      "Order tracking",
      "Email support",
    ],
    cta: "Start free",
    featured: false,
  },
  {
    name: "Growth",
    price: "$49",
    period: "/mo",
    description: "For growing stores that need more room and insight.",
    features: [
      "Unlimited products",
      "Admin dashboard & reports",
      "Customer & team management",
      "Role-based permissions",
      "Priority support",
    ],
    cta: "Start 14-day trial",
    featured: true,
  },
  {
    name: "Scale",
    price: "Custom",
    period: "",
    description: "For high-volume stores with advanced needs.",
    features: [
      "Everything in Growth",
      "Dedicated infrastructure",
      "Advanced analytics & exports",
      "SSO & audit logs",
      "Dedicated success manager",
    ],
    cta: "Contact sales",
    featured: false,
  },
]

export default function PricingPage() {
  return (
    <>
      {/* Header */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,color-mix(in_oklch,var(--primary),transparent_88%),transparent)]"
        />
        <div className="mx-auto max-w-3xl px-6 py-20 text-center md:py-28">
          <Badge variant="secondary" className="mb-6">
            <Sparkles className="fill-current" />
            No hidden fees
          </Badge>
          <h1 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">
            Pricing that scales with you
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-lg text-muted-foreground">
            Start free and upgrade when you grow. Every plan includes the
            storefront, secure checkout, and order tracking.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid items-start gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={
                plan.featured
                  ? "relative gap-0 p-8 ring-2 ring-primary"
                  : "relative gap-0 p-8"
              }
            >
              {plan.featured && (
                <Badge className="absolute -top-2.5 left-8">Most popular</Badge>
              )}
              <h3 className="font-semibold">{plan.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight">
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="text-sm text-muted-foreground">
                    {plan.period}
                  </span>
                )}
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                {plan.description}
              </p>

              <Button
                asChild
                variant={plan.featured ? "default" : "outline"}
                size="lg"
                className="mt-6 h-11 w-full text-base"
              >
                <Link href={plan.name === "Scale" ? "/contact" : "/login"}>
                  {plan.cta}
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>

              <ul className="mt-8 space-y-3 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

        <p className="mt-12 text-center text-sm text-muted-foreground">
          Have questions about plans?{" "}
          <Link href="/contact" className="font-medium text-foreground underline underline-offset-4">
            Talk to our team
          </Link>
          .
        </p>
      </section>
    </>
  )
}
