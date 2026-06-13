import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRight,
  CreditCard,
  LayoutDashboard,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
} from "lucide-react"

import { getProducts } from "@/services/product/product"
import { formatPrice, toNumber } from "@/lib/format"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Shop smarter — Your Store",
  description:
    "A modern storefront with curated products, fast checkout, and reliable delivery. Discover what shopping should feel like.",
}

// Reflect the live catalog (featured products) on each request.
export const dynamic = "force-dynamic"

const isImageSrc = (s: string) => /^(data:image\/|https?:\/\/|\/)/.test(s)

const features = [
  {
    icon: PackageCheck,
    title: "Curated catalog",
    description:
      "Hand-picked products organized into clean categories so you find what you need in seconds.",
  },
  {
    icon: CreditCard,
    title: "Frictionless checkout",
    description:
      "Secure payments and saved details mean you're a single tap away from done.",
  },
  {
    icon: Truck,
    title: "Fast, tracked delivery",
    description:
      "Real-time order tracking from warehouse to doorstep, with proactive updates.",
  },
  {
    icon: ShieldCheck,
    title: "Buyer protection",
    description:
      "Every order is backed by hassle-free returns and end-to-end encryption.",
  },
  {
    icon: LayoutDashboard,
    title: "Powerful admin tools",
    description:
      "Manage products, orders, customers, and reports from one unified dashboard.",
  },
  {
    icon: Sparkles,
    title: "Built to scale",
    description:
      "From your first sale to your millionth, the platform grows with your business.",
  },
]

const stats = [
  { value: "50k+", label: "Products shipped" },
  { value: "12k+", label: "Happy customers" },
  { value: "99.9%", label: "Uptime" },
  { value: "4.9/5", label: "Average rating" },
]

export default async function HomePage() {
  // A handful of live products to showcase on the landing page.
  const allProducts = await getProducts()
  const featured = allProducts
    .filter((p) => p.status === "Active")
    .slice(0, 8)
    .map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      picture: p.picture,
      category: p.category || p.categoryRel?.name || "",
      soldOut: toNumber(p.stock) <= 0,
    }))

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,color-mix(in_oklch,var(--primary),transparent_88%),transparent)]"
        />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:py-28 lg:grid-cols-2">
          {/* Left: copy */}
          <div className="text-center lg:text-left">
            <Badge variant="secondary" className="mb-6">
              <Star className="fill-current" />
              Rated 4.9 by 12,000+ shoppers
            </Badge>

            <h1 className="text-balance text-4xl font-bold tracking-tight md:text-6xl">
              Shopping that feels{" "}
              <span className="bg-gradient-to-r from-primary to-muted-foreground bg-clip-text text-transparent">
                effortless
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-pretty text-lg text-muted-foreground lg:mx-0">
              Browse a curated catalog, check out in seconds, and track every
              order to your door. One storefront, built for both shoppers and
              the teams behind them.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
              <Button asChild size="lg" className="h-11 px-6 text-base">
                <Link href="/shop">
                  Start shopping
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-11 px-6 text-base">
                <Link href="/features">Explore features</Link>
              </Button>
            </div>
          </div>

          {/* Right: spinning shoes-brand photo */}
          <div className="flex flex-col items-center gap-5 lg:items-end">
            <div className="relative">
              {/* soft glow behind the badge */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklch,var(--primary),transparent_70%),transparent)] blur-2xl"
              />
              {/* the photo glides left ↔ right on a loop (no vertical motion) */}
              <div className="brand-slide-x size-64 overflow-hidden rounded-full border-4 border-background shadow-xl ring-1 ring-border sm:size-80">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80"
                  alt="Featured shoes brand — sneakers"
                  className="size-full object-cover"
                />
              </div>
            </div>

            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <Badge>New</Badge>
              Featured: Court Sneakers
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured products — real items shoppers can see right away */}
      {featured.length > 0 && (
        <section id="featured" className="mx-auto max-w-6xl px-6 pb-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                Fresh in store
              </h2>
              <p className="mt-2 text-muted-foreground">
                A peek at what shoppers are loving right now.
              </p>
            </div>
            <Button asChild variant="ghost" size="sm" className="shrink-0">
              <Link href="/shop">
                View all
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((product) => (
              <Link
                key={product.id}
                href={`/shop/${product.id}`}
                className="group block"
              >
                <Card className="gap-0 p-0 transition-colors hover:border-foreground/20">
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
                    {product.soldOut && (
                      <div className="absolute inset-0 grid place-items-center bg-background/60 text-sm font-medium">
                        Sold out
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    {product.category && (
                      <div className="text-xs text-muted-foreground">
                        {product.category}
                      </div>
                    )}
                    <div className="mt-0.5 line-clamp-1 font-medium group-hover:underline">
                      {product.name}
                    </div>
                    <div className="mt-1 font-semibold">
                      {formatPrice(product.price)}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Stats */}
      <section id="stats" className="mt-16 border-y border-border/60 bg-muted/30">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px px-6 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="px-4 py-10 text-center">
              <div className="text-3xl font-bold tracking-tight md:text-4xl">
                {stat.value}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Everything you need to sell — and to shop
          </h2>
          <p className="mt-4 text-muted-foreground">
            A complete commerce stack: a delightful storefront on the front, a
            capable admin on the back.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
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

      {/* CTA */}
      <section id="cta" className="mx-auto max-w-6xl px-6 pb-24">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-primary px-6 py-16 text-center text-primary-foreground md:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_80%_at_50%_-10%,color-mix(in_oklch,var(--primary-foreground),transparent_85%),transparent)]"
          />
          <h2 className="mx-auto max-w-2xl text-balance text-3xl font-bold tracking-tight md:text-4xl">
            Ready to open your store?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-primary-foreground/80">
            Sign in to access your dashboard and start managing products,
            orders, and customers today.
          </p>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="mt-8 h-11 px-6 text-base"
          >
            <Link href="/shop">
              Start shopping
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  )
}
