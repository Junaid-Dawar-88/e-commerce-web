'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Settings as SettingsIcon,
  Store,
  CreditCard,
  Users,
  Bell,
  Shield,
  Truck,
  Percent,
  Palette,
  KeyRound,
  ScrollText,
  Check,
  RefreshCw,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { PermissionsPanel } from './permissions-panel'
import { DEFAULT_SETTINGS } from '@/app/admin/setting/data'
import { getSettings, saveSettings } from '@/app/api/setting-helper/setting-helper'
import { getAuditLogs } from '@/app/api/audit-helper/audit-helper'

type SectionKey =
  | 'general' | 'store' | 'payments' | 'users' | 'notifications'
  | 'security' | 'shipping' | 'taxes' | 'appearance' | 'apikeys' | 'audit'

const SECTIONS: { key: SectionKey; label: string; icon: LucideIcon }[] = [
  { key: 'general', label: 'General', icon: SettingsIcon },
  { key: 'store', label: 'Store', icon: Store },
  { key: 'payments', label: 'Payments', icon: CreditCard },
  { key: 'users', label: 'Users & Roles', icon: Users },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'security', label: 'Security', icon: Shield },
  { key: 'shipping', label: 'Shipping', icon: Truck },
  { key: 'taxes', label: 'Taxes', icon: Percent },
  { key: 'appearance', label: 'Appearance', icon: Palette },
  { key: 'apikeys', label: 'API Keys', icon: KeyRound },
  { key: 'audit', label: 'Audit Logs', icon: ScrollText },
]

type AuditLogRow = {
  id: string
  action: string
  category: string
  actorName: string
  actorEmail: string
  actorRole: string
  target: string
  createdAt: string
}

// Compact "2h ago" style relative time.
function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const s = Math.round(diff / 1000)
  if (s < 60) return 'just now'
  const m = Math.round(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.round(h / 24)
  if (d < 30) return `${d}d ago`
  return new Date(iso).toLocaleDateString()
}

const auditCategoryStyle: Record<string, string> = {
  auth: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  settings: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  product: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  category: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
  order: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  payment: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  customer: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  employee: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
  review: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
  system: 'bg-muted text-muted-foreground',
}

/* ---------- small building blocks ---------- */

function SettingsCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-card ring-1 ring-foreground/10">
      <div className="border-b px-5 py-3.5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
      </div>
      <div className="flex flex-col gap-5 p-5">{children}</div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2 sm:grid-cols-[180px_1fr] sm:items-center">
      <Label className="text-sm">{label}</Label>
      <div className="max-w-md">{children}</div>
    </div>
  )
}

function ToggleRow({ label, desc, checked, onChange }: { label: string; desc?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {desc && <p className="text-xs text-muted-foreground">{desc}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}

function CheckRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm">
      <Checkbox checked={checked} onCheckedChange={(v) => onChange(Boolean(v))} />
      {label}
    </label>
  )
}

const mask = (key: string) => `${key.slice(0, 7)}${'•'.repeat(12)}`

export function SettingsView() {
  const router = useRouter()
  const [active, setActive] = useState<SectionKey>('general')
  const [s, setS] = useState(DEFAULT_SETTINGS)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [audit, setAudit] = useState<AuditLogRow[] | null>(null)
  const set = (patch: Partial<typeof DEFAULT_SETTINGS>) => { setS((p) => ({ ...p, ...patch })); setSaved(false) }

  // Load the saved settings from Neon on mount.
  useEffect(() => {
    getSettings()
      .then((stored) => setS((prev) => ({ ...prev, ...stored })))
      .catch(() => {
        // Fall back to defaults if the API is unavailable.
      })
  }, [])

  // Load the audit trail the first time that tab is opened.
  useEffect(() => {
    if (active !== 'audit' || audit !== null) return
    getAuditLogs()
      .then((rows: AuditLogRow[]) => setAudit(rows))
      .catch(() => setAudit([]))
  }, [active, audit])

  function applyTheme(theme: 'light' | 'dark' | 'system') {
    set({ theme })
    const root = document.documentElement
    const dark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    root.classList.toggle('dark', dark)
  }

  async function save() {
    setSaving(true)
    try {
      await saveSettings(s)
      setSaved(true)
      // Re-render server components (e.g. the sidebar store name) with the new values.
      router.refresh()
    } catch {
      // Keep the form as-is if the save failed.
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">Configure your store and platform preferences.</p>
        </div>
        <Button onClick={save} disabled={saving}>
          {saved && !saving ? <Check className="size-4" /> : null}
          {saving ? 'Saving…' : saved ? 'Saved' : 'Save Changes'}
        </Button>
      </header>

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        {/* Nav */}
        <nav className="lg:sticky lg:top-6 lg:self-start">
          <div className="flex flex-col gap-0.5 rounded-xl bg-card p-2 ring-1 ring-foreground/10">
            {SECTIONS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActive(key)}
                className={cn(
                  'flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                  active === key
                    ? 'bg-accent font-medium text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
                )}
              >
                <Icon className={cn('size-4', active === key && 'text-primary')} />
                {label}
              </button>
            ))}
          </div>
        </nav>

        {/* Content */}
        <div className="flex flex-col gap-6">
          {active === 'general' && (
            <SettingsCard title="General Settings">
              <Field label="Store Name"><Input value={s.storeName} onChange={(e) => set({ storeName: e.target.value })} className="h-9" /></Field>
              <Field label="Email"><Input type="email" value={s.email} onChange={(e) => set({ email: e.target.value })} className="h-9" /></Field>
              <Field label="Phone"><Input value={s.phone} onChange={(e) => set({ phone: e.target.value })} className="h-9" /></Field>
              <Field label="Currency">
                <Select value={s.currency} onValueChange={(v) => set({ currency: v })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD — US Dollar</SelectItem>
                    <SelectItem value="PKR">PKR — Pakistani Rupee</SelectItem>
                    <SelectItem value="EUR">EUR — Euro</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Time Zone">
                <Select value={s.timezone} onValueChange={(v) => set({ timezone: v })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GMT+5">GMT +5 (Pakistan)</SelectItem>
                    <SelectItem value="GMT+0">GMT +0 (London)</SelectItem>
                    <SelectItem value="GMT-5">GMT −5 (New York)</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Language">
                <Select value={s.language} onValueChange={(v) => set({ language: v })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ur">Urdu</SelectItem>
                    <SelectItem value="ar">Arabic</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Branding">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" type="button">Upload Logo</Button>
                  <Button variant="outline" size="sm" type="button">Upload Favicon</Button>
                </div>
              </Field>
            </SettingsCard>
          )}

          {active === 'store' && (
            <SettingsCard title="Store Settings">
              <ToggleRow label="Store Status" desc={s.storeActive ? 'Active — store is open' : 'Maintenance mode'} checked={s.storeActive} onChange={(v) => set({ storeActive: v })} />
              <ToggleRow label="Guest Checkout" desc="Allow purchases without an account" checked={s.guestCheckout} onChange={(v) => set({ guestCheckout: v })} />
              <Field label="Min Order ($)"><Input type="number" value={s.minOrder} onChange={(e) => set({ minOrder: e.target.value })} className="h-9" /></Field>
              <Field label="Max Order ($)"><Input type="number" value={s.maxOrder} onChange={(e) => set({ maxOrder: e.target.value })} className="h-9" /></Field>
              <Field label="Product Approval">
                <Select value={s.productApproval} onValueChange={(v) => set({ productApproval: v })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto-approve</SelectItem>
                    <SelectItem value="manual">Manual review</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </SettingsCard>
          )}

          {active === 'payments' && (
            <div className="flex flex-col gap-6">
              <SettingsCard title="Payment Settings">
                <div>
                  <p className="mb-2 text-sm font-medium">Enabled Methods</p>
                  <div className="flex flex-wrap gap-4">
                    {(Object.keys(s.methods) as (keyof typeof s.methods)[]).map((m) => (
                      <CheckRow key={m} label={m} checked={s.methods[m]} onChange={(v) => set({ methods: { ...s.methods, [m]: v } })} />
                    ))}
                  </div>
                </div>
                <Field label="Stripe Key"><Input value={s.stripeKey} onChange={(e) => set({ stripeKey: e.target.value })} className="h-9 font-mono text-xs" /></Field>
                <Field label="Stripe Secret"><Input type="password" value={s.stripeSecret} onChange={(e) => set({ stripeSecret: e.target.value })} className="h-9 font-mono text-xs" /></Field>
                <Field label="Commission (%)"><Input type="number" value={s.commission} onChange={(e) => set({ commission: e.target.value })} className="h-9" /></Field>
                <ToggleRow label="Auto Refund" desc="Automatically process eligible refunds" checked={s.autoRefund} onChange={(v) => set({ autoRefund: v })} />
              </SettingsCard>

              <SettingsCard title="Bank & Wallet Accounts (Manual Transfer)">
                <p className="text-sm text-muted-foreground">
                  Shown to customers at checkout. Fill in an account number / IBAN to make
                  that method appear; leave it blank (or turn it off) to hide it. Customers
                  transfer the amount and enter the Transaction ID, which you verify here.
                </p>

                {/* JazzCash */}
                <div className="flex flex-col gap-3 rounded-lg border p-4">
                  <ToggleRow label="JazzCash" desc="Mobile wallet" checked={s.manualPayments.jazzcash.enabled} onChange={(v) => set({ manualPayments: { ...s.manualPayments, jazzcash: { ...s.manualPayments.jazzcash, enabled: v } } })} />
                  <Field label="Account title"><Input value={s.manualPayments.jazzcash.title} onChange={(e) => set({ manualPayments: { ...s.manualPayments, jazzcash: { ...s.manualPayments.jazzcash, title: e.target.value } } })} className="h-9" placeholder="Account holder name" /></Field>
                  <Field label="JazzCash number"><Input value={s.manualPayments.jazzcash.number} onChange={(e) => set({ manualPayments: { ...s.manualPayments, jazzcash: { ...s.manualPayments.jazzcash, number: e.target.value } } })} className="h-9" placeholder="03XX XXXXXXX" /></Field>
                </div>

                {/* Easypaisa */}
                <div className="flex flex-col gap-3 rounded-lg border p-4">
                  <ToggleRow label="Easypaisa" desc="Mobile wallet" checked={s.manualPayments.easypaisa.enabled} onChange={(v) => set({ manualPayments: { ...s.manualPayments, easypaisa: { ...s.manualPayments.easypaisa, enabled: v } } })} />
                  <Field label="Account title"><Input value={s.manualPayments.easypaisa.title} onChange={(e) => set({ manualPayments: { ...s.manualPayments, easypaisa: { ...s.manualPayments.easypaisa, title: e.target.value } } })} className="h-9" placeholder="Account holder name" /></Field>
                  <Field label="Easypaisa number"><Input value={s.manualPayments.easypaisa.number} onChange={(e) => set({ manualPayments: { ...s.manualPayments, easypaisa: { ...s.manualPayments.easypaisa, number: e.target.value } } })} className="h-9" placeholder="03XX XXXXXXX" /></Field>
                </div>

                {/* SadaPay */}
                <div className="flex flex-col gap-3 rounded-lg border p-4">
                  <ToggleRow label="SadaPay" desc="Digital bank — transfer to IBAN" checked={s.manualPayments.sadapay.enabled} onChange={(v) => set({ manualPayments: { ...s.manualPayments, sadapay: { ...s.manualPayments.sadapay, enabled: v } } })} />
                  <Field label="Account title"><Input value={s.manualPayments.sadapay.title} onChange={(e) => set({ manualPayments: { ...s.manualPayments, sadapay: { ...s.manualPayments.sadapay, title: e.target.value } } })} className="h-9" placeholder="Account holder name" /></Field>
                  <Field label="SadaPay IBAN"><Input value={s.manualPayments.sadapay.iban} onChange={(e) => set({ manualPayments: { ...s.manualPayments, sadapay: { ...s.manualPayments.sadapay, iban: e.target.value } } })} className="h-9 font-mono" placeholder="PK00SADA0000000000000000" /></Field>
                </div>

                {/* Bank */}
                <div className="flex flex-col gap-3 rounded-lg border p-4">
                  <ToggleRow label="Bank Transfer" desc="Direct bank account" checked={s.manualPayments.bank.enabled} onChange={(v) => set({ manualPayments: { ...s.manualPayments, bank: { ...s.manualPayments.bank, enabled: v } } })} />
                  <Field label="Bank name"><Input value={s.manualPayments.bank.bankName} onChange={(e) => set({ manualPayments: { ...s.manualPayments, bank: { ...s.manualPayments.bank, bankName: e.target.value } } })} className="h-9" placeholder="e.g. Meezan Bank" /></Field>
                  <Field label="Account title"><Input value={s.manualPayments.bank.title} onChange={(e) => set({ manualPayments: { ...s.manualPayments, bank: { ...s.manualPayments.bank, title: e.target.value } } })} className="h-9" placeholder="Account holder name" /></Field>
                  <Field label="Account number"><Input value={s.manualPayments.bank.number} onChange={(e) => set({ manualPayments: { ...s.manualPayments, bank: { ...s.manualPayments.bank, number: e.target.value } } })} className="h-9" placeholder="Account number" /></Field>
                  <Field label="IBAN"><Input value={s.manualPayments.bank.iban} onChange={(e) => set({ manualPayments: { ...s.manualPayments, bank: { ...s.manualPayments.bank, iban: e.target.value } } })} className="h-9 font-mono" placeholder="PK00XXXX0000000000000000" /></Field>
                </div>
              </SettingsCard>
            </div>
          )}

          {active === 'users' && (
            <SettingsCard title="Users & Roles">
              <div className="flex flex-col gap-3">
                {[
                  { role: 'Admin', access: 'Full access to everything' },
                  { role: 'Manager', access: 'Pages you grant below' },
                  { role: 'Staff', access: 'Pages you grant below' },
                  { role: 'Customer', access: 'Shop, own orders' },
                ].map((r) => (
                  <div key={r.role} className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
                    <span className="font-medium">{r.role}</span>
                    <span className="text-sm text-muted-foreground">{r.access}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-5">
                <p className="mb-1 text-sm font-medium">Employee Access Control</p>
                <p className="mb-4 text-xs text-muted-foreground">
                  Grant each employee which pages they can <span className="font-medium">view</span> and
                  which they can take <span className="font-medium">actions</span> on (create, edit,
                  delete). Changes take effect the next time they sign in.
                </p>
                <PermissionsPanel />
              </div>
            </SettingsCard>
          )}

          {active === 'notifications' && (
            <SettingsCard title="Notifications">
              <ToggleRow label="Email Notifications" checked={s.notify.email} onChange={(v) => set({ notify: { ...s.notify, email: v } })} />
              <ToggleRow label="Push Notifications" checked={s.notify.push} onChange={(v) => set({ notify: { ...s.notify, push: v } })} />
              <ToggleRow label="SMS Notifications" checked={s.notify.sms} onChange={(v) => set({ notify: { ...s.notify, sms: v } })} />
              <div className="border-t pt-4">
                <p className="mb-2 text-sm font-medium">Notify me about</p>
                <div className="flex flex-wrap gap-4">
                  {(Object.keys(s.events) as (keyof typeof s.events)[]).map((ev) => (
                    <CheckRow key={ev} label={ev} checked={s.events[ev]} onChange={(v) => set({ events: { ...s.events, [ev]: v } })} />
                  ))}
                </div>
              </div>
            </SettingsCard>
          )}

          {active === 'security' && (
            <SettingsCard title="Security">
              <ToggleRow label="Two-Factor Authentication" desc="Require a second factor at login" checked={s.twoFA} onChange={(v) => set({ twoFA: v })} />
              <Field label="Session Timeout">
                <Select value={s.sessionTimeout} onValueChange={(v) => set({ sessionTimeout: v })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Password Policy">
                <Select value={s.passwordPolicy} onValueChange={(v) => set({ passwordPolicy: v })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="strong">Strong</SelectItem>
                    <SelectItem value="strict">Strict</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <ToggleRow label="Rate Limiting" desc="Throttle suspicious request bursts" checked={s.rateLimiting} onChange={(v) => set({ rateLimiting: v })} />
            </SettingsCard>
          )}

          {active === 'shipping' && (
            <div className="flex flex-col gap-6">
              <SettingsCard title="Delivery Charge">
                <p className="text-sm text-muted-foreground">
                  Applied at checkout and shown to the customer. Turn it off for free
                  delivery, or set &ldquo;Free delivery over&rdquo; so large orders ship free.
                </p>
                <ToggleRow label="Charge for delivery" desc="Add a delivery fee to the order total" checked={s.delivery.enabled} onChange={(v) => set({ delivery: { ...s.delivery, enabled: v } })} />
                <Field label="Delivery charge ($)"><Input type="number" value={s.delivery.fee} onChange={(e) => set({ delivery: { ...s.delivery, fee: e.target.value } })} className="h-9" disabled={!s.delivery.enabled} /></Field>
                <Field label="Free delivery over ($)"><Input type="number" value={s.delivery.freeOver} onChange={(e) => set({ delivery: { ...s.delivery, freeOver: e.target.value } })} className="h-9" disabled={!s.delivery.enabled} /></Field>
              </SettingsCard>

              <SettingsCard title="Shipping Rates">
                <Field label="Standard ($)"><Input type="number" value={s.shipping.standard} onChange={(e) => set({ shipping: { ...s.shipping, standard: e.target.value } })} className="h-9" /></Field>
                <Field label="Express ($)"><Input type="number" value={s.shipping.express} onChange={(e) => set({ shipping: { ...s.shipping, express: e.target.value } })} className="h-9" /></Field>
                <Field label="Same Day ($)"><Input type="number" value={s.shipping.sameDay} onChange={(e) => set({ shipping: { ...s.shipping, sameDay: e.target.value } })} className="h-9" /></Field>
              </SettingsCard>
            </div>
          )}

          {active === 'taxes' && (
            <SettingsCard title="Tax Settings">
              <ToggleRow label="Enable Tax" checked={s.taxEnabled} onChange={(v) => set({ taxEnabled: v })} />
              <Field label="Tax Rate (%)"><Input type="number" value={s.taxRate} onChange={(e) => set({ taxRate: e.target.value })} className="h-9" disabled={!s.taxEnabled} /></Field>
              <ToggleRow label="Region-Based Tax" desc="Apply tax based on customer region" checked={s.regionBased} onChange={(v) => set({ regionBased: v })} />
            </SettingsCard>
          )}

          {active === 'appearance' && (
            <SettingsCard title="Appearance">
              <Field label="Theme">
                <div className="flex gap-2">
                  {(['light', 'dark', 'system'] as const).map((t) => (
                    <Button
                      key={t}
                      type="button"
                      size="sm"
                      variant={s.theme === t ? 'default' : 'outline'}
                      className="capitalize"
                      onClick={() => applyTheme(t)}
                    >
                      {t}
                    </Button>
                  ))}
                </div>
              </Field>
              <Field label="Primary Color">
                <div className="flex items-center gap-2">
                  <input type="color" value={s.primary} onChange={(e) => set({ primary: e.target.value })} className="size-9 cursor-pointer rounded-md border bg-transparent" />
                  <Input value={s.primary} onChange={(e) => set({ primary: e.target.value })} className="h-9 w-28 font-mono text-xs" />
                </div>
              </Field>
              <Field label="Accent Color">
                <div className="flex items-center gap-2">
                  <input type="color" value={s.accent} onChange={(e) => set({ accent: e.target.value })} className="size-9 cursor-pointer rounded-md border bg-transparent" />
                  <Input value={s.accent} onChange={(e) => set({ accent: e.target.value })} className="h-9 w-28 font-mono text-xs" />
                </div>
              </Field>
            </SettingsCard>
          )}

          {active === 'apikeys' && (
            <SettingsCard title="API Keys">
              {[
                { label: 'Stripe', key: s.stripeKey },
                { label: 'Cloudinary', key: 'cld_xxxxxxxxxxxx' },
                { label: 'Google OAuth', key: 'goa_xxxxxxxxxxxx' },
              ].map((k) => (
                <div key={k.label} className="flex items-center justify-between gap-4 rounded-lg bg-muted/50 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">{k.label}</p>
                    <p className="font-mono text-xs text-muted-foreground">{mask(k.key)}</p>
                  </div>
                  <Badge variant="outline" className="font-normal text-emerald-600 dark:text-emerald-400">Active</Badge>
                </div>
              ))}
              <Button variant="outline" size="sm" className="self-start" type="button" onClick={() => set({ stripeKey: `pk_live_${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}` })}>
                <RefreshCw className="size-4" /> Generate New Key
              </Button>
            </SettingsCard>
          )}

          {active === 'audit' && (
            <SettingsCard title="Audit Logs">
              {audit === null ? (
                <p className="py-6 text-center text-sm text-muted-foreground">Loading activity…</p>
              ) : audit.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No activity recorded yet.</p>
              ) : (
                <ul className="flex flex-col divide-y">
                  {audit.map((log) => (
                    <li key={log.id} className="flex items-center justify-between gap-4 py-3 text-sm first:pt-0 last:pb-0">
                      <div className="flex min-w-0 items-center gap-3">
                        <Badge
                          variant="secondary"
                          className={cn('shrink-0 font-normal capitalize', auditCategoryStyle[log.category] ?? auditCategoryStyle.system)}
                        >
                          {log.category}
                        </Badge>
                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            {log.action}
                            {log.target ? <span className="text-muted-foreground"> · {log.target}</span> : null}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {log.actorName}
                            {log.actorRole ? ` · ${log.actorRole}` : ''}
                          </p>
                        </div>
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground" title={new Date(log.createdAt).toLocaleString()}>
                        {relativeTime(log.createdAt)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </SettingsCard>
          )}
        </div>
      </div>
    </div>
  )
}
