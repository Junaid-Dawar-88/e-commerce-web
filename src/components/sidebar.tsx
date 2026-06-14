'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOutAction } from '@/app/actions/auth'
import { setThemeAction } from '@/app/actions/theme'
import type { Theme } from '@/lib/theme'
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Users,
  UserCog,
  ShoppingCart,
  CreditCard,
  Star,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  Store,
  User,
  Sun,
  Moon,
  ChevronsUpDown,
  Menu,
  X,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { canAccessPath, type Role } from '@/lib/permissions'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { NotificationBell } from '@/components/notification/notification-bell'

type NavItem = { href: string; label: string; icon: LucideIcon }

type SidebarProps = {
  user?: {
    name?: string | null
    email?: string | null
    role?: string | null
    modules?: string[]
  }
  // The user's saved theme, loaded from Neon by the admin layout.
  initialTheme?: Theme
  // The store name from Settings (falls back to "My Store").
  storeName?: string
}

const groups: { heading: string; items: NavItem[] }[] = [
  {
    heading: 'Overview',
    items: [
      { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/report', label: 'Reports', icon: BarChart3 },
    ],
  },
  {
    heading: 'Catalog',
    items: [
      { href: '/admin/product', label: 'Products', icon: Package },
      { href: '/admin/categories', label: 'Categories', icon: FolderTree },
      { href: '/admin/reviews', label: 'Reviews', icon: Star },
    ],
  },
  {
    heading: 'Sales',
    items: [
      { href: '/admin/order', label: 'Orders', icon: ShoppingCart },
      { href: '/admin/payment', label: 'Payments', icon: CreditCard },
      { href: '/admin/customer', label: 'Customers', icon: Users },
    ],
  },
  {
    heading: 'Team',
    items: [
      { href: '/admin/employee', label: 'Employees', icon: UserCog },
    ],
  },
  {
    heading: 'System',
    items: [
      { href: '/admin/notification', label: 'Notifications', icon: Bell },
    ],
  },
]

// Light/dark toggle persisted to Neon (server-side, no browser storage).
// `initialTheme` is the user's saved preference, read from the database.
function useTheme(initialTheme: Theme = 'system') {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const dark =
      initialTheme === 'dark' ||
      (initialTheme === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    document.documentElement.classList.toggle('dark', dark)
    setIsDark(dark)
  }, [initialTheme])

  const toggle = () => {
    setIsDark((prev) => {
      const next = !prev
      document.documentElement.classList.toggle('dark', next)
      // Persist to Neon (a no-op for the env-based admin).
      void setThemeAction(next ? 'dark' : 'light')
      return next
    })
  }

  return { isDark, toggle }
}

const Sidebar = ({ user, initialTheme, storeName = 'My Store' }: SidebarProps) => {
  const pathname = usePathname()
  const { isDark, toggle } = useTheme(initialTheme)
  // Drawer state for mobile (below `lg` the sidebar slides in over the content).
  const [open, setOpen] = useState(false)

  // Close the drawer on navigation.
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])
  const displayName = user?.name || 'User'
  const displayEmail = user?.email || ''
  const initial = displayName.charAt(0).toUpperCase()
  const role = (user?.role ?? undefined) as Role | undefined
  const modules = user?.modules

  // Only show nav links this user can open; drop now-empty groups.
  const visibleGroups = groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => canAccessPath(role, modules, item.href)),
    }))
    .filter((group) => group.items.length > 0)

  // Account is open to every panel user; Settings is permission-gated.
  const canSettings = canAccessPath(role, modules, '/admin/setting')
  const canNotifications = canAccessPath(role, modules, '/admin/notification')

  return (
    <>
      {/* Mobile top bar — opens the drawer (hidden from `lg` up). */}
      <header className="fixed inset-x-0 top-0 z-30 flex h-14 items-center gap-2 border-b bg-sidebar px-4 text-sidebar-foreground lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="flex size-9 items-center justify-center rounded-lg transition-colors hover:bg-sidebar-accent/60"
        >
          <Menu className="size-5" />
        </button>
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Store className="size-4" />
        </span>
        <p className="truncate text-sm font-semibold">{storeName}</p>
        {canNotifications && (
          <div className="ml-auto">
            <NotificationBell />
          </div>
        )}
      </header>

      {/* Backdrop behind the open drawer (mobile only). */}
      {open && (
        <div
          aria-hidden
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex h-screen w-64 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground transition-transform duration-200 ease-out lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand */}
        <div className="flex h-16 items-center gap-2.5 border-b px-4">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Store className="size-4.5" />
          </span>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-semibold">{storeName}</p>
            <p className="truncate text-xs text-muted-foreground">Admin Panel</p>
          </div>
          <div className="ml-auto flex items-center gap-1">
            {canNotifications && (
              <div className="hidden lg:block">
                <NotificationBell />
              </div>
            )}
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="flex size-8 items-center justify-center rounded-lg transition-colors hover:bg-sidebar-accent/60 lg:hidden"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {visibleGroups.map((group) => (
          <div key={group.heading} className="mb-5">
            <p className="mb-1.5 px-3 text-xs font-medium tracking-wide text-muted-foreground/70 uppercase">
              {group.heading}
            </p>
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const active = pathname === item.href
                const Icon = item.icon
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                        active
                          ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground'
                          : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
                      )}
                    >
                      <Icon
                        className={cn(
                          'size-4.5 shrink-0 transition-colors',
                          active ? 'text-primary' : 'text-muted-foreground group-hover:text-sidebar-foreground'
                        )}
                      />
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User menu */}
      <div className="border-t p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-sidebar-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {initial}
              </span>
              <div className="min-w-0 flex-1 leading-tight">
                <p className="truncate text-sm font-medium">{displayName}</p>
                <p className="truncate text-xs text-muted-foreground">{displayEmail}</p>
              </div>
              <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            side="top"
            sideOffset={8}
            className="w-56"
          >
            <DropdownMenuLabel className="flex flex-col">
              <span className="text-sm font-medium text-foreground">{displayName}</span>
              <span className="truncate text-xs font-normal text-muted-foreground">{displayEmail}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link href="/admin/account">
                <User className="size-4" /> Account
              </Link>
            </DropdownMenuItem>

            {canSettings && (
              <DropdownMenuItem asChild>
                <Link href="/admin/setting">
                  <Settings className="size-4" /> Settings
                </Link>
              </DropdownMenuItem>
            )}

            {/* Keep the menu open after toggling so the change is visible. */}
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault()
                toggle()
              }}
            >
              {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
              {isDark ? 'Light mode' : 'Dark mode'}
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <form action={signOutAction}>
              <DropdownMenuItem asChild variant="destructive">
                <button type="submit" className="w-full">
                  <LogOut className="size-4" /> Log out
                </button>
              </DropdownMenuItem>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
    </>
  )
}

export default Sidebar
