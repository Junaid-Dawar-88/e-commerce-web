import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRight,
  BarChart3,
  Bell,
  CreditCard,
  LayoutDashboard,
  PackageCheck,
  Search,
  ShieldCheck,
  Sparkles,
  Truck,
  Users,
  Wallet,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Features — Your Store",
  description:
    "From a curated storefront to a powerful admin dashboard, explore everything Your Store gives shoppers and the teams behind them.",
}

const shopperFeatures = [
  {
    icon: Search,
    title: "Instant search & filters",
    description:
      "Find any product fast with type-ahead search, category filters, and smart sorting.",
  },
  {
    icon: PackageCheck,
    title: "Curated catalog",
    description:
      "Hand-picked products organized into clean categories and subcategories.",
  },
  {
    icon: CreditCard,
    title: "Frictionless checkout",
    description:
      "Secure payments with saved details — done in a single tap.",
  },
  {
    icon: Truck,
    title: "Tracked delivery",
    description:
      "Real-time order tracking from warehouse to doorstep with proactive updates.",
  },
  {
    icon: ShieldCheck,
    title: "Buyer protection",
    description:
      "Every order is backed by hassle-free returns and end-to-end encryption.",
  },
  {
    icon: Bell,
    title: "Smart notifications",
    description:
      "Stay in the loop on orders, restocks, and price drops on the things you love.",
  },
]

const adminFeatures = [
  {
    icon: LayoutDashboard,
    title: "Unified dashboard",
    description:
      "Products, orders, customers, and revenue — all in one command center.",
  },
  {
    icon: BarChart3,
    title: "Reports & analytics",
    description:
      "Live revenue, traffic, and category charts to understand what sells.",
  },
  {
    icon: Users,
    title: "Customer & team management",
    description:
      "Manage customers, employees, and granular role-based permissions.",
  },
  {
    icon: Wallet,
    title: "Payments & invoices",
    description:
      "Track payments, generate receipts, and export PDF invoices in a click.",
  },
]

export default function FeaturesPage() {
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
            Built for shoppers and sellers
          </Badge>
          <h1 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">
            One platform, every part of commerce
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-lg text-muted-foreground">
            A delightful storefront on the front, and a capable admin on the
            back. Here&apos;s everything you get out of the box.
          </p>
        </div>
      </section>

      {/* For shoppers */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="mb-10">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            For shoppers
          </h2>
          <p className="mt-2 text-muted-foreground">
            A storefront that gets out of the way.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shopperFeatures.map((feature) => (
            <Card
              key={feature.title}
              className="group p-6 transition-colors hover:border-foreground/20"
            >
              <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-105">
                <feature.icon className="size-5" />
              </div>
              <h3 className="mt-5 font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* For teams */}
      <section className="border-t border-border/60 bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-10">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
              For teams
            </h2>
            <p className="mt-2 text-muted-foreground">
              Run the whole business from one dashboard.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {adminFeatures.map((feature) => (
              <Card
                key={feature.title}
                className="group flex-row items-start gap-4 p-6 transition-colors hover:border-foreground/20"
              >
                <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-105">
                  <feature.icon className="size-5" />
                </div>
                <div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <h2 className="mx-auto max-w-2xl text-balance text-3xl font-bold tracking-tight md:text-4xl">
          See it in action
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
          Sign in to explore the storefront and the admin dashboard for
          yourself.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="h-11 px-6 text-base">
            <Link href="/login">
              Get started
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-11 px-6 text-base">
            <Link href="/pricing">View pricing</Link>
          </Button>
        </div>
      </section>
    </>
  )
}
