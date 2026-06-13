'use client'

import { useEffect, useMemo, useState } from 'react'
import { Check, Loader2, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { MODULES, DEFAULT_MODULES } from '@/lib/permissions'
import {
  getEmployees,
  updateEmployee,
} from '@/app/api/employee-helper/employee-helper'

// Minimal shape of an employee row returned by GET /api/employee.
type EmployeeRow = {
  id: string
  name: string
  email: string
  access: 'manager' | 'staff'
  permissions: string[] | null
  [key: string]: unknown
}

const initials = (name: string) =>
  name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()

export function PermissionsPanel() {
  const [employees, setEmployees] = useState<EmployeeRow[]>([])
  // Working copy of each employee's granted module keys, keyed by id.
  const [draft, setDraft] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [savedId, setSavedId] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    getEmployees()
      .then((rows: EmployeeRow[]) => {
        if (!active) return
        setEmployees(rows)
        setDraft(
          Object.fromEntries(rows.map((r) => [r.id, r.permissions ?? []]))
        )
      })
      .catch(() => active && setError('You do not have access to manage permissions.'))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  function toggle(empId: string, key: string) {
    setSavedId(null)
    setDraft((prev) => {
      const current = prev[empId] ?? []
      return {
        ...prev,
        [empId]: current.includes(key)
          ? current.filter((k) => k !== key)
          : [...current, key],
      }
    })
  }

  function applyPreset(emp: EmployeeRow) {
    setSavedId(null)
    setDraft((prev) => ({ ...prev, [emp.id]: [...DEFAULT_MODULES[emp.access]] }))
  }

  function clearAll(empId: string) {
    setSavedId(null)
    setDraft((prev) => ({ ...prev, [empId]: [] }))
  }

  async function save(emp: EmployeeRow) {
    setSavingId(emp.id)
    setSavedId(null)
    try {
      // Send the full row back with the updated grant; unchanged fields are
      // preserved by the update service.
      await updateEmployee(emp.id, {
        ...emp,
        permissions: draft[emp.id] ?? [],
      } as never)
      setEmployees((prev) =>
        prev.map((e) =>
          e.id === emp.id ? { ...e, permissions: draft[emp.id] ?? [] } : e
        )
      )
      setSavedId(emp.id)
    } catch {
      setError('Failed to save permissions. Please try again.')
    } finally {
      setSavingId(null)
    }
  }

  const dirty = useMemo(() => {
    const map: Record<string, boolean> = {}
    for (const e of employees) {
      const a = [...(e.permissions ?? [])].sort().join(',')
      const b = [...(draft[e.id] ?? [])].sort().join(',')
      map[e.id] = a !== b
    }
    return map
  }, [employees, draft])

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Loading employees…
      </div>
    )
  }

  if (error) {
    return <p className="py-4 text-sm text-destructive">{error}</p>
  }

  if (employees.length === 0) {
    return (
      <p className="py-4 text-sm text-muted-foreground">
        No employees yet. Add an employee first, then grant their page access here.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-2 rounded-lg bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
        <p>
          Choose exactly which pages each employee can open. Everyone always has
          Dashboard and Account; new employees start with nothing else until you
          grant it here.
        </p>
      </div>

      {employees.map((emp) => {
        const granted = draft[emp.id] ?? []
        return (
          <div key={emp.id} className="rounded-xl border bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {initials(emp.name) || '?'}
                </span>
                <div className="leading-tight">
                  <p className="text-sm font-medium">{emp.name}</p>
                  <p className="text-xs text-muted-foreground">{emp.email}</p>
                </div>
                <Badge variant="outline" className="ml-1 font-normal capitalize">
                  {emp.access}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => applyPreset(emp)}
                >
                  Apply {emp.access} preset
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => clearAll(emp.id)}
                >
                  Clear
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={!dirty[emp.id] || savingId === emp.id}
                  onClick={() => save(emp)}
                >
                  {savingId === emp.id ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : savedId === emp.id ? (
                    <Check className="size-4" />
                  ) : null}
                  {savedId === emp.id && !dirty[emp.id] ? 'Saved' : 'Save'}
                </Button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {MODULES.map((m) => (
                <label
                  key={m.key}
                  className="flex cursor-pointer items-center gap-2 rounded-md border border-input px-3 py-2 text-sm has-[:checked]:border-primary/40 has-[:checked]:bg-primary/5"
                >
                  <Checkbox
                    checked={granted.includes(m.key)}
                    onCheckedChange={() => toggle(emp.id, m.key)}
                  />
                  {m.label}
                </label>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
