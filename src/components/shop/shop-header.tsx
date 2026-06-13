"use client"

import Link from "next/link"
import { LogOut, ShoppingBag, ShoppingCart, User } from "lucide-react"

import { signOutAction } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { useCart } from "@/components/shop/cart-provider"

type ShopHeaderProps = {
  user: { name: string | null; role: string } | null
}

export function ShopHeader({ user }: ShopHeaderProps) {
  const { count } = useCart()

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
        <Link href="/shop" className="flex items-center gap-2 font-semibold">
          <span className="grid size-7 place-items-center rounded-lg bg-primary text-primary-foreground">
            <ShoppingBag className="size-4" />
          </span>
          Your Store
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <Link href="/shop" className="transition-colors hover:text-foreground">
            Shop
          </Link>
          <Link
            href="/account/orders"
            className="transition-colors hover:text-foreground"
          >
            My orders
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="relative">
            <Link href="/cart" aria-label={`Cart, ${count} items`}>
              <ShoppingCart />
              {count > 0 && (
                <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </Link>
          </Button>

          {user ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/account/orders">
                  <User data-icon="inline-start" />
                  <span className="hidden sm:inline">
                    {user.name?.split(" ")[0] ?? "Account"}
                  </span>
                </Link>
              </Button>
              <form action={signOutAction}>
                <Button type="submit" variant="ghost" size="icon-sm" aria-label="Sign out">
                  <LogOut />
                </Button>
              </form>
            </>
          ) : (
            <Button asChild size="sm">
              <Link href="/login?callbackUrl=/shop">Sign in</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
