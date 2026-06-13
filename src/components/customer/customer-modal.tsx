'use client'

import { useEffect, useState } from 'react'
import { Mail, MapPin, Phone, User } from 'lucide-react'
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
import type { CustomerStatus } from '@/app/admin/customer/data'

export type NewCustomer = {
  name: string
  email: string
  phone: string
  status: CustomerStatus
  city: string
  state: string
  country: string
}

const STATUS_OPTIONS: { value: CustomerStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'vip', label: 'VIP' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'blocked', label: 'Blocked' },
]

const EMPTY: NewCustomer = {
  name: '',
  email: '',
  phone: '',
  status: 'active',
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

type CustomerModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: (customer: NewCustomer) => void
  // When set, the modal is in edit mode and pre-fills with this customer.
  initial?: NewCustomer | null
}

const fieldLabel = 'mb-1.5 text-muted-foreground'

const CustomerModal = ({ open, onOpenChange, onSave, initial }: CustomerModalProps) => {
  const [form, setForm] = useState<NewCustomer>(EMPTY)

  useEffect(() => {
    if (open) setForm(initial ?? EMPTY)
  }, [open, initial])

  function update<K extends keyof NewCustomer>(key: K, value: NewCustomer[K]) {
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
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-lg" showCloseButton>
        {/* Banner header with avatar preview */}
        <DialogHeader className="gap-3 border-b bg-muted/40 p-5">
          <div className="flex items-center gap-3">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-semibold text-primary ring-1 ring-primary/20">
              {initials(form.name) || <User className="size-5" />}
            </span>
            <div className="leading-tight">
              <DialogTitle className="text-lg">
                {initial ? 'Edit Customer' : 'Add New Customer'}
              </DialogTitle>
              <DialogDescription>
                {form.name || 'Create a new customer profile'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmit()
          }}
          className="grid gap-5 p-5"
        >
          {/* Identity */}
          <div className="grid gap-4">
            <div>
              <Label htmlFor="cust-name" className={fieldLabel}>
                <User className="size-4" />
                Full Name
              </Label>
              <Input
                id="cust-name"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="Junaid Iqbal"
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="cust-email" className={fieldLabel}>
                  <Mail className="size-4" />
                  Email
                </Label>
                <Input
                  id="cust-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  placeholder="junaid@example.com"
                />
              </div>
              <div>
                <Label htmlFor="cust-phone" className={fieldLabel}>
                  <Phone className="size-4" />
                  Phone
                </Label>
                <Input
                  id="cust-phone"
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  placeholder="+92 300 1234567"
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <Label htmlFor="cust-status" className={fieldLabel}>
              Status
            </Label>
            <Select
              value={form.status}
              onValueChange={(v) => update('status', v as CustomerStatus)}
            >
              <SelectTrigger id="cust-status" className="w-full">
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

          {/* Location */}
          <div className="grid gap-4">
            <Label className="text-muted-foreground">
              <MapPin className="size-4" />
              Location
            </Label>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="cust-city" className={fieldLabel}>
                  City
                </Label>
                <Input
                  id="cust-city"
                  value={form.city}
                  onChange={(e) => update('city', e.target.value)}
                  placeholder="Hyderabad"
                />
              </div>
              <div>
                <Label htmlFor="cust-state" className={fieldLabel}>
                  State
                </Label>
                <Input
                  id="cust-state"
                  value={form.state}
                  onChange={(e) => update('state', e.target.value)}
                  placeholder="Sindh"
                />
              </div>
              <div>
                <Label htmlFor="cust-country" className={fieldLabel}>
                  Country
                </Label>
                <Input
                  id="cust-country"
                  value={form.country}
                  onChange={(e) => update('country', e.target.value)}
                  placeholder="Pakistan"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="mx-0 mb-0 bg-transparent p-0 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">{initial ? 'Update Customer' : 'Save Customer'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CustomerModal
