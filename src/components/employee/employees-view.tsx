'use client'

import { useMemo, useState } from 'react'
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
  Plane,
  Building2,
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
import {
  mapEmployee,
  type Employee,
  type EmployeeStatus,
} from '@/app/admin/employee/data'
import {
  addEmployee,
  deleteEmployee,
  updateEmployee,
} from '@/app/api/employee-helper/employee-helper'
import EmployeeModal, { type NewEmployee } from './employee-modal'

const statusMeta: Record<EmployeeStatus, { label: string; badge: string }> = {
  active: { label: 'Active', badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  on_leave: { label: 'On Leave', badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  inactive: { label: 'Inactive', badge: 'bg-muted text-muted-foreground' },
}

const initials = (name: string) =>
  name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()

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

export function EmployeesView({ initialEmployees }: { initialEmployees: Employee[] }) {
  const router = useRouter()
  const [items, setItems] = useState<Employee[]>(initialEmployees)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<EmployeeStatus | 'all'>('all')
  const [department, setDepartment] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Employee | null>(null)

  const departments = useMemo(
    () => Array.from(new Set(items.map((e) => e.department))).sort(),
    [items]
  )

  const stats = useMemo(() => ({
    total: items.length,
    active: items.filter((e) => e.status === 'active').length,
    onLeave: items.filter((e) => e.status === 'on_leave').length,
    departments: departments.length,
  }), [items, departments])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((emp) => {
      const matchesQuery =
        !q ||
        emp.name.toLowerCase().includes(q) ||
        emp.email.toLowerCase().includes(q) ||
        emp.role.toLowerCase().includes(q)
      const matchesStatus = status === 'all' || emp.status === status
      const matchesDept = department === 'all' || emp.department === department
      return matchesQuery && matchesStatus && matchesDept
    })
  }, [items, query, status, department])

  const openDetail = (id: string) => router.push(`/admin/employee/${id}`)

  async function remove(id: string) {
    await deleteEmployee(id)
    setItems((prev) => prev.filter((e) => e.id !== id))
  }

  function openAdd() {
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(emp: Employee) {
    setEditing(emp)
    setModalOpen(true)
  }

  // Build the modal's prefill from the view-model (password is never echoed back).
  const editInitial: NewEmployee | null = editing
    ? {
        name: editing.name,
        email: editing.email,
        phone: editing.phone,
        role: editing.role,
        department: editing.department,
        access: editing.access,
        permissions: editing.permissions,
        status: editing.status,
        salary: editing.salary,
        city: editing.city,
        state: editing.state,
        country: editing.country,
      }
    : null

  async function handleSave(emp: NewEmployee) {
    if (editing?.id) {
      const row = await updateEmployee(editing.id, emp)
      const mapped = mapEmployee(row)
      setItems((prev) => prev.map((e) => (e.id === editing.id ? mapped : e)))
    } else {
      const row = await addEmployee(emp)
      setItems((prev) => [mapEmployee(row), ...prev])
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Employee Management</h1>
          <p className="text-sm text-muted-foreground">View and manage your team members.</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="size-4" /> Add Employee
        </Button>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Total Employees" value={stats.total.toLocaleString()} icon={Users} accent="oklch(0.55 0.22 264)" />
        <StatTile label="Active" value={stats.active.toLocaleString()} icon={UserCheck} accent="oklch(0.72 0.16 158)" />
        <StatTile label="On Leave" value={stats.onLeave.toLocaleString()} icon={Plane} accent="oklch(0.77 0.16 70)" />
        <StatTile label="Departments" value={stats.departments.toLocaleString()} icon={Building2} accent="oklch(0.7 0.14 195)" />
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
        <div className="relative min-w-50 flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search employee…" value={query} onChange={(e) => setQuery(e.target.value)} className="h-9 pl-8" />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as EmployeeStatus | 'all')}>
          <SelectTrigger size="sm" className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="on_leave">On Leave</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Select value={department} onValueChange={setDepartment}>
          <SelectTrigger size="sm" className="w-44"><SelectValue placeholder="Department" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All departments</SelectItem>
            {departments.map((d) => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl bg-card ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Employee</TableHead>
              <TableHead className="hidden lg:table-cell">Email</TableHead>
              <TableHead className="hidden sm:table-cell">Role</TableHead>
              <TableHead className="hidden xl:table-cell">Department</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Joined</TableHead>
              <TableHead className="w-12 pr-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((emp) => (
              <TableRow key={emp.id} onClick={() => openDetail(emp.id)} className="cursor-pointer">
                <TableCell className="pl-4">
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {initials(emp.name)}
                    </span>
                    <span className="font-medium">{emp.name}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden text-muted-foreground lg:table-cell">{emp.email}</TableCell>
                <TableCell className="hidden sm:table-cell">{emp.role}</TableCell>
                <TableCell className="hidden text-muted-foreground xl:table-cell">{emp.department}</TableCell>
                <TableCell>
                  <Badge className={cn('font-normal', statusMeta[emp.status].badge)}>{statusMeta[emp.status].label}</Badge>
                </TableCell>
                <TableCell className="hidden text-muted-foreground md:table-cell">{emp.joined}</TableCell>
                <TableCell className="pr-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8" aria-label="Actions">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => openDetail(emp.id)}>
                        <Eye className="size-4" /> View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEdit(emp)}>
                        <Pencil className="size-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive" onClick={() => remove(emp.id)}>
                        <Trash2 className="size-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">No employees found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <EmployeeModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSave={handleSave}
        initial={editInitial}
      />
    </div>
  )
}
