'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOutAction } from '@/app/actions/auth'
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
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { canAccessPath, type Role } from '@/lib/permissions'

type NavItem = { href: string; label: string; icon: LucideIcon }

type SidebarProps = {
  user?: {
    name?: string | null
    email?: string | null
    role?: string | null
    modules?: string[]
  }
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
      { href: '/admin/account', label: 'Account', icon: User },
      { href: '/admin/setting', label: 'Settings', icon: Settings },
    ],
  },
]

const Sidebar = ({ user }: SidebarProps) => {
  const pathname = usePathname()
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

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground">
      {/* Brand */}
      <div className="flex h-16 items-center gap-2.5 border-b px-5">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Store className="size-4.5" />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold">My Store</p>
          <p className="text-xs text-muted-foreground">Admin Panel</p>
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

      {/* User / logout */}
      <div className="border-t p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {initial}
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-medium">{displayName}</p>
            <p className="truncate text-xs text-muted-foreground">{displayEmail}</p>
          </div>
          <form action={signOutAction} className="contents">
            <button
              type="submit"
              aria-label="Log out"
              className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
            >
              <LogOut className="size-4" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
