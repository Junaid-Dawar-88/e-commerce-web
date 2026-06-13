'use client'

import { useEffect, useState } from 'react'
import { Briefcase, Mail, MapPin, Phone, Shield, User } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { EmployeeAccess, EmployeeStatus } from '@/app/admin/employee/data'

export type NewEmployee = {
  name: string
  email: string
  phone: string
  role: string
  department: string
  access: EmployeeAccess
  permissions: string[]
  status: EmployeeStatus
  salary: number
  city: string
  state: string
  country: string
}

const STATUS_OPTIONS: { value: EmployeeStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'on_leave', label: 'On Leave' },
  { value: 'inactive', label: 'Inactive' },
]

const ACCESS_OPTIONS: { value: EmployeeAccess; label: string }[] = [
  { value: 'manager', label: 'Manager' },
  { value: 'staff', label: 'Staff' },
]

const EMPTY: NewEmployee = {
  name: '',
  email: '',
  phone: '',
  role: '',
  department: '',
  access: 'staff',
  // New employees start with NO page access. The admin grants pages later
  // from Settings → Users & Roles.
  permissions: [],
  status: 'active',
  salary: 0,
  city: '',
  state: '',
  country: '',
}

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

type EmployeeModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: (employee: NewEmployee) => void
  // When set, the modal is in edit mode and pre-fills with this employee.
  initial?: NewEmployee | null
}

const fieldLabel = 'mb-1.5 text-muted-foreground'

const EmployeeModal = ({ open, onOpenChange, onSave, initial }: EmployeeModalProps) => {
  const [form, setForm] = useState<NewEmployee>(EMPTY)

  useEffect(() => {
    if (!open) return
    // Carry the employee's existing page grant through untouched on edit;
    // page access is managed in Settings, not here.
    setForm(initial ? { ...initial } : EMPTY)
  }, [open, initial])

  function update<K extends keyof NewEmployee>(key: K, value: NewEmployee[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function reset() {
    setForm(EMPTY)
  }

  function handleSubmit() {
    onSave?.(form)
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset()
        onOpenChange(next)
      }}
    >
      <DialogContent
        className="grid-rows-[auto_minmax(0,1fr)] max-h-[88vh] gap-0 overflow-hidden p-0 sm:max-w-lg"
        showCloseButton
      >
        {/* Banner header with avatar preview */}
        <DialogHeader className="gap-3 border-b bg-muted/40 p-5">
          <div className="flex items-center gap-3">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-semibold text-primary ring-1 ring-primary/20">
              {initials(form.name) || <User className="size-5" />}
            </span>
            <div className="leading-tight">
              <DialogTitle className="text-lg">
                {initial ? 'Edit Employee' : 'Add New Employee'}
              </DialogTitle>
              <DialogDescription>
                {form.role ? `${form.role}` : 'Create a new employee account'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmit()
          }}
          className="flex min-h-0 flex-col"
        >
          <div className="grid min-h-0 flex-1 gap-5 overflow-y-auto p-5">
            {/* Account */}
            <div className="grid gap-4">
              <div>
                <Label htmlFor="emp-name" className={fieldLabel}>
                  <User className="size-4" />
                  Full Name
                </Label>
                <Input
                  id="emp-name"
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  placeholder="Sara Mehmood"
                  required
                />
              </div>
              <div>
                <Label htmlFor="emp-email" className={fieldLabel}>
                  <Mail className="size-4" />
                  Email
                </Label>
                <Input
                  id="emp-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  placeholder="sara.employee@store.com"
                />
                {!initial && (
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    A temporary password will be emailed to the employee — they can
                    change it (and their email) after signing in.
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="emp-phone" className={fieldLabel}>
                  <Phone className="size-4" />
                  Phone
                </Label>
                <Input
                  id="emp-phone"
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  placeholder="+92 300 1112233"
                />
              </div>
            </div>

            {/* Job */}
            <div className="grid gap-4">
              <Label className="text-muted-foreground">
                <Briefcase className="size-4" />
                Job Details
              </Label>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="emp-role" className={fieldLabel}>
                    Role
                  </Label>
                  <Input
                    id="emp-role"
                    value={form.role}
                    onChange={(e) => update('role', e.target.value)}
                    placeholder="Store Manager"
                  />
                </div>
                <div>
                  <Label htmlFor="emp-department" className={fieldLabel}>
                    Department
                  </Label>
                  <Input
                    id="emp-department"
                    value={form.department}
                    onChange={(e) => update('department', e.target.value)}
                    placeholder="Operations"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="emp-status" className={fieldLabel}>
                    Status
                  </Label>
                  <Select
                    value={form.status}
                    onValueChange={(v) => update('status', v as EmployeeStatus)}
                  >
                    <SelectTrigger id="emp-status" className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="emp-salary" className={fieldLabel}>
                    Salary
                  </Label>
                  <Input
                    id="emp-salary"
                    type="number"
                    min={0}
                    value={form.salary || ''}
                    onChange={(e) => update('salary', Number(e.target.value))}
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="emp-access" className={fieldLabel}>
                  <Shield className="size-4" />
                  Role
                </Label>
                <Select
                  value={form.access}
                  onValueChange={(v) => update('access', v as EmployeeAccess)}
                >
                  <SelectTrigger id="emp-access" className="w-full">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACCESS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  New employees start with no page access. Grant the pages they
                  can open in Settings → Users &amp; Roles.
                </p>
              </div>
            </div>

            {/* Location */}
            <div className="grid gap-4">
              <Label className="text-muted-foreground">
                <MapPin className="size-4" />
                Location
              </Label>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <Label htmlFor="emp-city" className={fieldLabel}>
                    City
                  </Label>
                  <Input
                    id="emp-city"
                    value={form.city}
                    onChange={(e) => update('city', e.target.value)}
                    placeholder="Karachi"
                  />
                </div>
                <div>
                  <Label htmlFor="emp-state" className={fieldLabel}>
                    State
                  </Label>
                  <Input
                    id="emp-state"
                    value={form.state}
                    onChange={(e) => update('state', e.target.value)}
                    placeholder="Sindh"
                  />
                </div>
                <div>
                  <Label htmlFor="emp-country" className={fieldLabel}>
                    Country
                  </Label>
                  <Input
                    id="emp-country"
                    value={form.country}
                    onChange={(e) => update('country', e.target.value)}
                    placeholder="Pakistan"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t bg-muted/50 p-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">{initial ? 'Update Employee' : 'Save Employee'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default EmployeeModal
