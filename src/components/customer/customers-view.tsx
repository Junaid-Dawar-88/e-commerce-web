'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  Plus,
  Eye,
  Pencil,
  MoreHorizontal,
  Trash2,
  Users,
  UserCheck,
  UserPlus,
  Crown,
  type LucideIcon,
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { customers as seedCustomers, mapCustomer, type Customer, type CustomerStatus } from '@/app/admin/customer/data'
import {
  addCustomer,
  deleteCustomer,
  getCustomers,
  updateCustomer,
} from '@/app/api/customer-helper/customer-helper'
import CustomerModal, { type NewCustomer } from './customer-modal'

const statusMeta: Record<CustomerStatus, { label: string; badge: string }> = {
  active: { label: 'Active', badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  vip: { label: 'VIP', badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  blocked: { label: 'Blocked', badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' },
  inactive: { label: 'Inactive', badge: 'bg-muted text-muted-foreground' },
}

const usd = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
const initials = (name: string) => name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()

function StatTile({ label, value, icon: Icon, accent }: { label: string; value: string; icon: LucideIcon; accent: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
      <span
        className="flex size-11 items-center justify-center rounded-lg"
        style={{ background: `color-mix(in oklch, ${accent} 14%, transparent)`, color: accent }}
      >
        <Icon className="size-5" />
      </span>
      <div className="leading-tight">
        <p className="text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

export function CustomersView() {
  const router = useRouter()
  const [items, setItems] = useState<Customer[]>(seedCustomers)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<CustomerStatus | 'all'>('all')
  const [ordersBand, setOrdersBand] = useState('all')
  const [joined, setJoined] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Customer | null>(null)

  useEffect(() => {
    getCustomers()
      .then((rows) => setItems(rows.map(mapCustomer)))
      .catch(() => {
        // Leave the table empty if the API is unavailable.
      })
  }, [])

  const stats = useMemo(() => ({
    total: items.length,
    active: items.filter((c) => c.status === 'active' || c.status === 'vip').length,
    newThisMonth: items.filter((c) => c.daysAgo <= 30).length,
    vip: items.filter((c) => c.status === 'vip').length,
  }), [items])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((cust) => {
      const matchesQuery = !q || cust.name.toLowerCase().includes(q) || cust.email.toLowerCase().includes(q)
      const matchesStatus = status === 'all' || cust.status === status
      const matchesOrders =
        ordersBand === 'all' ||
        (ordersBand === 'low' && cust.orders < 10) ||
        (ordersBand === 'mid' && cust.orders >= 10 && cust.orders <= 25) ||
        (ordersBand === 'high' && cust.orders > 25)
      const matchesJoined = joined === 'all' || cust.daysAgo <= Number(joined)
      return matchesQuery && matchesStatus && matchesOrders && matchesJoined
    })
  }, [items, query, status, ordersBand, joined])

  const openDetail = (id: string) => router.push(`/admin/customer/${id}`)

  function openAdd() {
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(cust: Customer) {
    setEditing(cust)
    setModalOpen(true)
  }

  async function handleSave(form: NewCustomer) {
    if (editing?.id) {
      const row = await updateCustomer(editing.id, form)
      const mapped = mapCustomer(row)
      setItems((prev) => prev.map((c) => (c.id === editing.id ? mapped : c)))
    } else {
      const row = await addCustomer(form)
      setItems((prev) => [mapCustomer(row), ...prev])
    }
  }

  async function remove(id: string) {
    await deleteCustomer(id)
    setItems((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Customer Management</h1>
          <p className="text-sm text-muted-foreground">View and manage your customer base.</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="size-4" /> Add Customer
        </Button>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Total Customers" value={stats.total.toLocaleString()} icon={Users} accent="oklch(0.55 0.22 264)" />
        <StatTile label="Active Customers" value={stats.active.toLocaleString()} icon={UserCheck} accent="oklch(0.72 0.16 158)" />
        <StatTile label="New This Month" value={stats.newThisMonth.toLocaleString()} icon={UserPlus} accent="oklch(0.7 0.14 195)" />
        <StatTile label="VIP Customers" value={stats.vip.toLocaleString()} icon={Crown} accent="oklch(0.77 0.16 70)" />
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
        <div className="relative min-w-50 flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search customer…" value={query} onChange={(e) => setQuery(e.target.value)} className="h-9 pl-8" />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as CustomerStatus | 'all')}>
          <SelectTrigger size="sm" className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="vip">VIP</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Select value={ordersBand} onValueChange={setOrdersBand}>
          <SelectTrigger size="sm" className="w-36"><SelectValue placeholder="Orders" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any orders</SelectItem>
            <SelectItem value="low">Under 10</SelectItem>
            <SelectItem value="mid">10 – 25</SelectItem>
            <SelectItem value="high">Over 25</SelectItem>
          </SelectContent>
        </Select>
        <Select value={joined} onValueChange={setJoined}>
          <SelectTrigger size="sm" className="w-40"><SelectValue placeholder="Date Joined" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All time</SelectItem>
            <SelectItem value="30">This month</SelectItem>
            <SelectItem value="365">This year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Customer</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Orders</TableHead>
              <TableHead className="text-right">Total Spent</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-12 pr-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((cust) => (
              <TableRow key={cust.id} onClick={() => openDetail(cust.id)} className="cursor-pointer">
                <TableCell className="pl-4">
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {initials(cust.name)}
                    </span>
                    <span className="font-medium">{cust.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{cust.email}</TableCell>
                <TableCell className="text-right tabular-nums">{cust.orders}</TableCell>
                <TableCell className="text-right tabular-nums">{usd(cust.totalSpent)}</TableCell>
                <TableCell>
                  <Badge className={cn('font-normal', statusMeta[cust.status].badge)}>{statusMeta[cust.status].label}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{cust.joined}</TableCell>
                <TableCell className="pr-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8" aria-label="Actions">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => openDetail(cust.id)}>
                        <Eye className="size-4" /> View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEdit(cust)}>
                        <Pencil className="size-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive" onClick={() => remove(cust.id)}>
                        <Trash2 className="size-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">No customers found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <CustomerModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSave={handleSave}
        initial={editing}
      />
    </div>
  )
}
