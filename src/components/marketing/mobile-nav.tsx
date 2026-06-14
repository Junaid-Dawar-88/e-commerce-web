"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowRight, Menu, X } from "lucide-react"

import { Button } from "@/components/ui/button"

const links = [
  { href: "/shop", label: "Shop" },
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
]

// Hamburger menu for the marketing header — visible only below `md`.
export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Close the menu whenever the route changes.
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Lock body scroll while the overlay menu is open.
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X /> : <Menu />}
      </Button>

      {open && (
        <>
          {/* backdrop */}
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 top-16 z-40 bg-background/40 backdrop-blur-sm"
          />
          {/* panel */}
          <div className="absolute inset-x-0 top-16 z-50 border-b border-border/60 bg-background/95 shadow-lg backdrop-blur-md">
            <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-6 py-4">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="rounded-lg px-3 py-3 text-base font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {l.label}
                </Link>
              ))}

              <div className="mt-3 flex flex-col gap-2 border-t border-border/60 pt-4">
                <Button asChild variant="outline" size="lg" className="h-11 justify-center text-base">
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button asChild size="lg" className="h-11 justify-center text-base">
                  <Link href="/shop">
                    Shop now
                    <ArrowRight data-icon="inline-end" />
                  </Link>
                </Button>
              </div>
            </nav>
          </div>
        </>
      )}
    </div>
  )
}
