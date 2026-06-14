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
import { getCategories } from "@/services/category/category"
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

const trustedBy = [
  "Northwind",
  "Acme Co",
  "Globex",
  "Umbrella",
  "Initech",
  "Soylent",
  "Hooli",
  "Vandelay",
]

export default async function HomePage() {
  // Live catalog + categories power the showcase and the "shop by category" grid.
  const [allProducts, allCategories] = await Promise.all([
    getProducts(),
    getCategories(),
  ])

  const featured = allProducts
    .filter((p) => p.status === "Active")
    // Newest first so "Fresh in store" surfaces the latest arrivals.
    .sort((a, b) => b.id - a.id)
    .slice(0, 8)
    .map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      picture: p.picture,
      category: p.category || p.categoryRel?.name || "",
      soldOut: toNumber(p.stock) <= 0,
    }))

  // Up to 6 active categories for the visual "shop by category" tiles.
  // NOTE: CategoryStatus is lowercase ('active'), unlike ProductStatus ('Active').
  const categories = allCategories
    .filter((c) => c.status === "active")
    .slice(0, 6)
    .map((c) => ({
      name: c.name,
      image: c.image,
      // Count live products so each tile can show real inventory depth.
      count: allProducts.filter(
        (p) =>
          p.status === "Active" &&
          (p.category || p.categoryRel?.name) === c.name
      ).length,
    }))

  return (
    <>
      {/* Hero — vibrant aurora mesh canvas */}
      <section className="aurora relative overflow-hidden">
        {/* drifting brand orbs */}
        <div
          aria-hidden
          className="orb pointer-events-none absolute -left-24 -top-24 -z-10 size-96 bg-brand/40"
        />
        <div
          aria-hidden
          className="orb orb-slow pointer-events-none absolute -right-28 top-10 -z-10 size-[28rem] bg-brand-2/35"
        />
        <div
          aria-hidden
          className="orb pointer-events-none absolute bottom-0 left-1/3 -z-10 size-80 bg-brand-3/30"
        />
        {/* faint grid texture, masked at the edges */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(75%_65%_at_50%_0%,black,transparent)] bg-[linear-gradient(to_right,color-mix(in_oklch,var(--foreground),transparent_95%)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--foreground),transparent_95%)_1px,transparent_1px)] bg-[size:46px_46px]"
        />

        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:py-28 lg:grid-cols-2">
          {/* Left: copy */}
          <div className="text-center lg:text-left">
            <Badge
              variant="secondary"
              className="mb-6 gap-1.5 border border-brand/30 bg-background/60 text-foreground shadow-sm backdrop-blur-sm"
            >
              <Star className="size-3 fill-current text-brand" />
              Rated 4.9 by 12,000+ shoppers
            </Badge>

            <h1 className="text-balance text-4xl font-bold tracking-tight md:text-6xl">
              Shopping that feels{" "}
              <span className="brand-text brand-text-animate">effortless</span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-pretty text-lg text-muted-foreground lg:mx-0">
              Browse a curated catalog, check out in seconds, and track every
              order to your door. One storefront, built for both shoppers and
              the teams behind them.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
              <Button
                asChild
                size="lg"
                className="h-11 bg-linear-to-r from-brand to-brand-2 px-6 text-base text-white shadow-lg shadow-brand/25 transition-shadow hover:shadow-xl hover:shadow-brand/35"
              >
                <Link href="/shop">
                  Shop new arrivals
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-11 border-brand/30 bg-background/60 px-6 text-base backdrop-blur-sm"
              >
                <Link href="/#categories">Browse categories</Link>
              </Button>
            </div>

            {/* inline trust signals */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-muted-foreground lg:justify-start">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="size-4 text-brand" />
                Buyer protection
              </span>
              <span className="inline-flex items-center gap-2">
                <Truck className="size-4 text-brand-2" />
                Free tracked delivery
              </span>
            </div>
          </div>

          {/* Right: layered glass product showcase */}
          <div className="relative mx-auto h-80 w-full max-w-md sm:h-96">
            {/* vivid brand glow behind the photo */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--brand-2),transparent_60%),transparent)] blur-2xl"
            />

            {/* gradient ring framing the brand photo */}
            <div className="brand-slide-x absolute left-1/2 top-1/2 size-60 -translate-x-1/2 -translate-y-1/2 rounded-[2rem] bg-linear-to-br from-brand via-brand-2 to-brand-3 p-1 shadow-2xl sm:size-72">
              <div className="size-full overflow-hidden rounded-[1.7rem] border-2 border-background">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/shoes/shoe-2.jpeg"
                  alt="Featured shoes brand — sneakers"
                  className="size-full object-cover"
                />
              </div>
            </div>

            {/* floating glass card — price */}
            <div className="float-y absolute left-0 top-6 flex items-center gap-3 rounded-2xl border border-border/60 bg-background/70 p-3 shadow-xl backdrop-blur-md">
              <div className="grid size-9 place-items-center rounded-xl bg-brand/15 text-brand">
                <PackageCheck className="size-4" />
              </div>
              <div className="text-left">
                <div className="text-xs text-muted-foreground">Court Sneakers</div>
                <div className="text-sm font-semibold">$129.00</div>
              </div>
            </div>

            {/* floating glass card — order status */}
            <div className="float-y-slow absolute bottom-4 right-0 flex items-center gap-3 rounded-2xl border border-border/60 bg-background/70 p-3 shadow-xl backdrop-blur-md">
              <div className="grid size-9 place-items-center rounded-xl bg-brand-2/15 text-brand-2">
                <Truck className="size-4" />
              </div>
              <div className="text-left">
                <div className="text-xs text-muted-foreground">Order shipped</div>
                <div className="text-sm font-semibold">Arrives tomorrow</div>
              </div>
            </div>
          </div>
        </div>

        {/* Trusted-by marquee */}
        <div className="mx-auto max-w-6xl px-6 pb-12">
          <p className="text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Trusted by teams everywhere
          </p>
          <div className="group relative mt-6 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
            <div className="marquee-track flex w-max items-center gap-12 group-hover:[animation-play-state:paused]">
              {[...trustedBy, ...trustedBy].map((name, i) => (
                <span
                  key={`${name}-${i}`}
                  className="flex items-center gap-2 text-lg font-semibold text-muted-foreground/70"
                >
                  <Sparkles className="size-4 text-brand/70" />
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Shop by category — product-forward visual tiles (modern e-comm staple) */}
      {categories.length > 0 && (
        <section
          id="categories"
          className="reveal mx-auto max-w-6xl scroll-mt-20 px-6 pt-16"
        >
          <div className="flex items-end justify-between gap-4">
            <div>
              <Badge
                variant="secondary"
                className="mb-3 border border-brand/30 bg-brand/10 text-brand"
              >
                Shop by category
              </Badge>
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                Find your aisle
              </h2>
              <p className="mt-2 text-muted-foreground">
                Jump straight to what you&apos;re looking for.
              </p>
            </div>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="shrink-0 text-brand hover:text-brand"
            >
              <Link href="/shop">
                Browse all
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          </div>

          {/* Bento grid: the first tile spans wider on large screens for rhythm. */}
          <div className="mt-8 grid auto-rows-[11rem] grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {categories.map((cat, i) => (
              <Link
                key={cat.name}
                href={`/shop?category=${encodeURIComponent(cat.name)}`}
                className={`group relative overflow-hidden rounded-3xl border border-border/60 ${
                  i === 0 ? "col-span-2 row-span-2" : ""
                }`}
              >
                {cat.image && isImageSrc(cat.image) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="absolute inset-0 size-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                  />
                ) : (
                  <div className="absolute inset-0 bg-linear-to-br from-brand/25 via-brand-2/20 to-brand-3/25" />
                )}

                {/* readability scrim + brand wash on hover */}
                <div
                  aria-hidden
                  className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-linear-to-t from-brand/60 via-brand-2/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />

                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4 text-white">
                  <div>
                    <div className="font-semibold drop-shadow-sm">{cat.name}</div>
                    <div className="text-xs text-white/80">
                      {cat.count} {cat.count === 1 ? "item" : "items"}
                    </div>
                  </div>
                  <span className="grid size-8 shrink-0 translate-y-1 place-items-center rounded-full bg-white/20 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <ArrowRight className="size-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured products — real items shoppers can see right away */}
      {featured.length > 0 && (
        <section id="featured" className="reveal mx-auto max-w-6xl px-6 pb-8 pt-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                Fresh in store
              </h2>
              <p className="mt-2 text-muted-foreground">
                A peek at what shoppers are loving right now.
              </p>
            </div>
            <Button asChild variant="ghost" size="sm" className="shrink-0 text-brand hover:text-brand">
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
                <Card className="gap-0 overflow-hidden p-0 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:ring-brand/40">
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    {product.picture && isImageSrc(product.picture) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.picture}
                        alt={product.name}
                        className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                      />
                    ) : (
                      <div className="grid size-full place-items-center text-4xl">
                        {product.picture || "📦"}
                      </div>
                    )}

                    {/* brand veil that fades in on hover for legibility + depth */}
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 bg-linear-to-t from-brand/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    />

                    {/* category chip overlaid on the image */}
                    {product.category && (
                      <Badge
                        variant="secondary"
                        className="absolute left-2.5 top-2.5 border border-border/50 bg-background/70 backdrop-blur-md"
                      >
                        {product.category}
                      </Badge>
                    )}

                    {/* quick-view arrow reveals on hover */}
                    <div className="absolute bottom-2.5 right-2.5 grid size-9 translate-y-2 place-items-center rounded-full bg-linear-to-br from-brand to-brand-2 text-white opacity-0 shadow-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      <ArrowRight className="size-4" />
                    </div>

                    {product.soldOut && (
                      <div className="absolute inset-0 grid place-items-center bg-background/60 text-sm font-medium backdrop-blur-sm">
                        <Badge variant="secondary" className="border border-border/60">
                          Sold out
                        </Badge>
                      </div>
                    )}
                  </div>

                  <div className="flex items-start justify-between gap-2 p-4">
                    <div className="min-w-0">
                      <div className="line-clamp-1 font-medium group-hover:underline">
                        {product.name}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        Free delivery
                      </div>
                    </div>
                    <div className="shrink-0 text-right font-semibold tabular-nums">
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
      <section
        id="stats"
        className="mt-16 border-y border-border/60 bg-linear-to-r from-brand/8 via-brand-2/8 to-brand-3/8"
      >
        <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-border/60 px-6 md:grid-cols-4 [&>*]:nth-[n+3]:border-t [&>*]:nth-[n+3]:border-border/60 md:[&>*]:nth-[n+3]:border-t-0">
          {stats.map((stat) => (
            <div key={stat.label} className="px-4 py-10 text-center">
              <div className="brand-text text-3xl font-bold tracking-tight md:text-4xl">
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
      <section id="features" className="reveal mx-auto max-w-6xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <Badge
            variant="secondary"
            className="mb-4 border border-brand/30 bg-brand/10 text-brand"
          >
            Everything in one place
          </Badge>
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
              className="group relative overflow-hidden p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-brand/40"
            >
              {/* hover glow in brand hues */}
              <div
                aria-hidden
                className="pointer-events-none absolute -right-12 -top-12 size-32 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--brand-2),transparent_72%),transparent)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />
              <div className="grid size-11 place-items-center rounded-xl bg-linear-to-br from-brand to-brand-2 text-white shadow-md shadow-brand/20 transition-transform duration-300 group-hover:scale-110">
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
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-brand via-brand-2 to-brand-3 px-6 py-16 text-center text-white shadow-2xl shadow-brand/30 md:py-20">
          {/* glossy highlight + grid texture */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_90%_at_50%_-10%,rgba(255,255,255,0.45),transparent)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(60%_60%_at_50%_0%,black,transparent)] bg-[linear-gradient(to_right,rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.12)_1px,transparent_1px)] bg-[size:36px_36px]"
          />
          <h2 className="relative mx-auto max-w-2xl text-balance text-3xl font-bold tracking-tight md:text-4xl">
            Ready to open your store?
          </h2>
          <p className="relative mx-auto mt-4 max-w-lg text-white/85">
            Sign in to access your dashboard and start managing products,
            orders, and customers today.
          </p>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="relative mt-8 h-11 bg-white px-6 text-base text-brand hover:bg-white/90"
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
