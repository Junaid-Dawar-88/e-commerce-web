'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Check,
  Loader2,
  ShieldCheck,
  ChevronDown,
  Eye,
  Plus,
  Pencil,
  Trash2,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  MODULES,
  normalizeGrants,
  presetGrants,
  fullAccessGrants,
  type Action,
} from '@/lib/permissions'
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

// Columns shown in the matrix, in order. "view" is always present; the rest are
// only enabled for modules that support them.
const COLUMNS: { action: Action; label: string; icon: LucideIcon }[] = [
  { action: 'view', label: 'View', icon: Eye },
  { action: 'create', label: 'Create', icon: Plus },
  { action: 'update', label: 'Update', icon: Pencil },
  { action: 'delete', label: 'Delete', icon: Trash2 },
]

const initials = (name: string) =>
  name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()

const sortedKey = (tokens: string[]) => [...tokens].sort().join(',')

export function PermissionsPanel() {
  const [employees, setEmployees] = useState<EmployeeRow[]>([])
  // Working copy of each employee's granted tokens ("products:create"), by id.
  const [draft, setDraft] = useState<Record<string, string[]>>({})
  const [open, setOpen] = useState<Record<string, boolean>>({})
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
          Object.fromEntries(
            rows.map((r) => [r.id, normalizeGrants(r.permissions)])
          )
        )
      })
      .catch(() => active && setError('You do not have access to manage permissions.'))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  const has = (empId: string, token: string) =>
    (draft[empId] ?? []).includes(token)

  // Toggle one capability. An action implies "view"; clearing "view" clears
  // every action for that page (you can't act on a page you can't open).
  function setCap(empId: string, key: string, action: Action, on: boolean) {
    setSavedId(null)
    setDraft((prev) => {
      const set = new Set(prev[empId] ?? [])
      if (action === 'view') {
        if (on) set.add(`${key}:view`)
        else {
          set.delete(`${key}:view`)
          for (const a of ['create', 'update', 'delete']) set.delete(`${key}:${a}`)
        }
      } else {
        if (on) {
          set.add(`${key}:${action}`)
          set.add(`${key}:view`)
        } else set.delete(`${key}:${action}`)
      }
      return { ...prev, [empId]: [...set] }
    })
  }

  const applyTokens = (empId: string, tokens: string[]) => {
    setSavedId(null)
    setDraft((prev) => ({ ...prev, [empId]: tokens }))
  }

  async function save(emp: EmployeeRow) {
    setSavingId(emp.id)
    setSavedId(null)
    try {
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
      map[e.id] =
        sortedKey(normalizeGrants(e.permissions)) !== sortedKey(draft[e.id] ?? [])
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
        No employees yet. Add an employee first, then grant their access here.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-2 rounded-lg bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
        <p>
          Per page, grant <span className="font-medium text-foreground">View</span> to open it, then
          pick exactly which actions they may take — <span className="font-medium text-foreground">Create</span>,{' '}
          <span className="font-medium text-foreground">Update</span>, or{' '}
          <span className="font-medium text-foreground">Delete</span>. Everyone always has Dashboard and
          Account; new employees start with nothing else.
        </p>
      </div>

      {employees.map((emp) => {
        const tokens = draft[emp.id] ?? []
        const pages = tokens.filter((t) => t.endsWith(':view')).length
        const actions = tokens.filter((t) => !t.endsWith(':view')).length
        const expanded = open[emp.id] ?? false
        return (
          <div key={emp.id} className="rounded-xl border bg-card">
            {/* Header — click to expand/collapse */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4">
              <button
                type="button"
                onClick={() => setOpen((p) => ({ ...p, [emp.id]: !expanded }))}
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
              >
                <ChevronDown
                  className={cn('size-4 shrink-0 text-muted-foreground transition-transform', expanded && 'rotate-180')}
                />
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {initials(emp.name) || '?'}
                </span>
                <span className="min-w-0 leading-tight">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium">{emp.name}</span>
                    <Badge variant="outline" className="font-normal capitalize">{emp.access}</Badge>
                    {dirty[emp.id] && (
                      <span className="size-1.5 rounded-full bg-amber-500" title="Unsaved changes" />
                    )}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {emp.email} · {pages} {pages === 1 ? 'page' : 'pages'} · {actions} {actions === 1 ? 'action' : 'actions'}
                  </span>
                </span>
              </button>
              <div className="flex items-center gap-1.5">
                <Button type="button" variant="ghost" size="sm" onClick={() => applyTokens(emp.id, presetGrants(emp.access))}>
                  {emp.access} preset
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => applyTokens(emp.id, fullAccessGrants())}>
                  All
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => applyTokens(emp.id, [])}>
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
                  ) : savedId === emp.id && !dirty[emp.id] ? (
                    <Check className="size-4" />
                  ) : null}
                  {savedId === emp.id && !dirty[emp.id] ? 'Saved' : 'Save'}
                </Button>
              </div>
            </div>

            {/* Permission matrix */}
            {expanded && (
              <div className="overflow-hidden border-t">
                {/* Column header */}
                <div className="flex items-center gap-2 bg-muted/40 px-4 py-2 text-xs font-medium text-muted-foreground">
                  <span className="flex-1">Page</span>
                  {COLUMNS.map((c) => (
                    <span key={c.action} className="flex w-16 items-center justify-center gap-1">
                      <c.icon className="size-3.5" /> {c.label}
                    </span>
                  ))}
                </div>

                {MODULES.map((m, i) => (
                  <div
                    key={m.key}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 text-sm',
                      i % 2 === 1 && 'bg-muted/20'
                    )}
                  >
                    <span className="flex-1 font-medium">{m.label}</span>
                    {COLUMNS.map((c) => {
                      const supported = c.action === 'view' || m.actions.includes(c.action)
                      return (
                        <span key={c.action} className="flex w-16 justify-center">
                          {supported ? (
                            <Checkbox
                              checked={has(emp.id, `${m.key}:${c.action}`)}
                              onCheckedChange={(v) => setCap(emp.id, m.key, c.action, v === true)}
                              aria-label={`${m.label} — ${c.label}`}
                            />
                          ) : (
                            <span className="text-xs text-muted-foreground" title="Not applicable to this page">—</span>
                          )}
                        </span>
                      )
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
