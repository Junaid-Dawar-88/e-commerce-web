import Link from "next/link"
import { ShoppingBag } from "lucide-react"

import { getCurrentUser } from "@/lib/rbac"
import { getSettings } from "@/services/setting/setting"
import { CartProvider } from "@/components/shop/cart-provider"
import { ShopHeader } from "@/components/shop/shop-header"

export default async function ShopLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [user, settings] = await Promise.all([getCurrentUser(), getSettings()])
  const storeName = settings.storeName

  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <ShopHeader
          user={user ? { name: user.name ?? null, role: user.role } : null}
          storeName={storeName}
        />

        <main className="flex-1">{children}</main>

        <footer className="border-t border-border/60">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground sm:flex-row">
            <div className="flex items-center gap-2 font-medium text-foreground">
              <span className="grid size-6 place-items-center rounded-md bg-primary text-primary-foreground">
                <ShoppingBag className="size-3.5" />
              </span>
              {storeName}
            </div>
            <nav className="flex items-center gap-6">
              <Link href="/" className="transition-colors hover:text-foreground">
                Home
              </Link>
              <Link
                href="/shop"
                className="transition-colors hover:text-foreground"
              >
                Shop
              </Link>
              <Link
                href="/contact"
                className="transition-colors hover:text-foreground"
              >
                Contact
              </Link>
            </nav>
            <p>© 2026 {storeName}. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </CartProvider>
  )
}
