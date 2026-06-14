import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { MobileNav } from "@/components/marketing/mobile-nav"
import { getSettings } from "@/services/setting/setting"

const footerLinks = [
  {
    title: "Shop",
    links: [
      { label: "All products", href: "/shop" },
      { label: "Featured", href: "/#featured" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Features", href: "/features" },
      { label: "Contact", href: "/contact" },
      { label: "Sign in", href: "/login" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help center", href: "/contact" },
      { label: "Order tracking", href: "/shop" },
      { label: "Returns", href: "/contact" },
    ],
  },
]

export default async function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { storeName } = await getSettings()

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt={storeName}
              className="size-9 rounded-full object-cover ring-1 ring-border/60"
            />
            {storeName}
          </Link>

          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <Link href="/shop" className="transition-colors hover:text-foreground">
              Shop
            </Link>
            <Link href="/features" className="transition-colors hover:text-foreground">
              Features
            </Link>
            <Link href="/pricing" className="transition-colors hover:text-foreground">
              Pricing
            </Link>
            <Link href="/contact" className="transition-colors hover:text-foreground">
              Contact
            </Link>
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/shop">
                Shop now
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          </div>

          {/* Mobile: hamburger menu with the same links + actions. */}
          <MobileNav />
        </div>
      </header>

      {children}

      {/* Footer */}
      <footer className="border-t border-border/60 bg-muted/20">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt={storeName}
                className="size-9 rounded-full object-cover ring-1 ring-border/60"
              />
              {storeName}
            </Link>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              A modern storefront with curated products, fast checkout, and
              reliable delivery.
            </p>
          </div>

          {footerLinks.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold">{col.title}</h3>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border/60">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-6 text-sm text-muted-foreground sm:flex-row">
            <p>© 2026 {storeName}. All rights reserved.</p>
            <p>Built for shoppers and the teams behind them.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
