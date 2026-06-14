'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Mail,
  Ban,
  CircleCheck,
  Trash2,
  Phone,
  MapPin,
  Briefcase,
  Building2,
  CalendarDays,
  Wallet,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useMoney } from '@/components/store-provider'
import type { Employee, EmployeeStatus } from '@/app/admin/employee/data'

const statusMeta: Record<EmployeeStatus, { label: string; badge: string }> = {
  active: { label: 'Active', badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  on_leave: { label: 'On Leave', badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  inactive: { label: 'Inactive', badge: 'bg-muted text-muted-foreground' },
}

const initials = (name: string) => name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()

function Card({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-card p-5 ring-1 ring-foreground/10">
      <h2 className="mb-4 flex items-center gap-2 font-medium">
        <span className="text-muted-foreground">{icon}</span>
        {title}
      </h2>
      {children}
    </div>
  )
}

export function EmployeeDetail({ employee }: { employee: Employee }) {
  const router = useRouter()
  const usd = useMoney()
  const [status, setStatus] = useState<EmployeeStatus>(employee.status)
  const isInactive = status === 'inactive'

  function toggleActive() {
    setStatus((prev) => (prev === 'inactive' ? 'active' : 'inactive'))
  }

  function deleteEmployee() {
    if (confirm(`Delete ${employee.name}? This cannot be undone.`)) {
      router.push('/admin/employee')
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="icon" className="size-9">
            <Link href="/admin/employee" aria-label="Back to employees">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-base font-semibold text-primary">
            {initials(employee.name)}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">{employee.name}</h1>
              <Badge className={cn('font-normal', statusMeta[status].badge)}>{statusMeta[status].label}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{employee.role} · {employee.department}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline">
            <a href={`mailto:${employee.email}`}>
              <Mail className="size-4" /> Send Email
            </a>
          </Button>
          <Button variant="outline" onClick={toggleActive}>
            {isInactive ? <CircleCheck className="size-4" /> : <Ban className="size-4" />}
            {isInactive ? 'Reactivate' : 'Deactivate'}
          </Button>
          <Button variant="destructive" onClick={deleteEmployee}>
            <Trash2 className="size-4" /> Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Left column */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card title="Contact Information" icon={<Phone className="size-4" />}>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Full Name" value={employee.name} />
              <Field label="Email" value={employee.email} />
              <Field label="Phone" value={employee.phone} />
              <Field label="Joined" value={employee.joinedLong} />
            </dl>
          </Card>

          <Card title="Employment" icon={<Briefcase className="size-4" />}>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Role" value={employee.role} />
              <Field label="Department" value={employee.department} />
              <Field label="Salary" value={usd(employee.salary)} />
              <Field label="Employee ID" value={employee.id} />
            </dl>
          </Card>

          <Card title="Address" icon={<MapPin className="size-4" />}>
            <p className="text-sm leading-relaxed">
              {employee.city}<br />
              {employee.state}<br />
              {employee.country}
            </p>
          </Card>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          <Card title="Department" icon={<Building2 className="size-4" />}>
            <p className="text-lg font-medium">{employee.department}</p>
            <p className="text-sm text-muted-foreground">{employee.role}</p>
          </Card>

          <Card title="Salary" icon={<Wallet className="size-4" />}>
            <p className="text-3xl font-semibold tabular-nums">{usd(employee.salary)}</p>
            <p className="text-sm text-muted-foreground">Annual compensation</p>
          </Card>

          <Card title="Member Since" icon={<CalendarDays className="size-4" />}>
            <p className="text-lg font-medium">{employee.joinedLong}</p>
            <p className="text-sm text-muted-foreground">{Math.floor(employee.daysAgo / 30)} months on the team</p>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-medium">{value}</dd>
    </div>
  )
}
