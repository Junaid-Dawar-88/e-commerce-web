'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { Bell, Check, Lock, Mail, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { getAccount, updateAccount } from '@/app/api/account-helper/account-helper'
import type { Account } from '@/types/account'

const fieldLabel = 'mb-1.5 text-muted-foreground'

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-card ring-1 ring-foreground/10">
      <div className="border-b px-5 py-3.5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
      </div>
      <div className="flex flex-col gap-5 p-5">{children}</div>
    </div>
  )
}

function ToggleRow({
  label,
  desc,
  checked,
  onChange,
  disabled,
}: {
  label: string
  desc?: string
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {desc && <p className="text-xs text-muted-foreground">{desc}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} />
    </div>
  )
}

export function AccountView() {
  const [account, setAccount] = useState<Account | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [notifyEmail, setNotifyEmail] = useState(true)
  const [notifyPush, setNotifyPush] = useState(true)
  const [notifySms, setNotifySms] = useState(false)
  const [pending, setPending] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getAccount()
      .then((a: Account) => {
        setAccount(a)
        setName(a.name)
        setEmail(a.email)
        setNotifyEmail(a.notifyEmail)
        setNotifyPush(a.notifyPush)
        setNotifySms(a.notifySms)
      })
      .catch(() => setError('Could not load your account.'))
  }, [])

  const isAdmin = account?.role === 'admin'

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (isAdmin) return
    setPending(true)
    setSaved(false)
    setError(null)
    try {
      const updated = await updateAccount({
        name,
        email,
        password: password || undefined,
        notifyEmail,
        notifyPush,
        notifySms,
      })
      setAccount(updated)
      setPassword('')
      setSaved(true)
    } catch {
      setError('Could not save your changes.')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Account</h1>
          <p className="text-sm text-muted-foreground">Update your profile and notification preferences.</p>
        </div>
        {account && (
          <Badge variant="outline" className="font-normal capitalize">{account.role}</Badge>
        )}
      </header>

      {isAdmin && (
        <p className="rounded-lg bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
          The admin account is managed via environment variables and can&apos;t be edited here.
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <Card title="Profile">
          <div>
            <Label htmlFor="acc-name" className={fieldLabel}>
              <User className="size-4" /> Full Name
            </Label>
            <Input
              id="acc-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              disabled={isAdmin}
              required
            />
          </div>
          <div>
            <Label htmlFor="acc-email" className={fieldLabel}>
              <Mail className="size-4" /> Email
            </Label>
            <Input
              id="acc-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={isAdmin}
              required
            />
          </div>
          <div>
            <Label htmlFor="acc-password" className={fieldLabel}>
              <Lock className="size-4" /> New Password
            </Label>
            <Input
              id="acc-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank to keep current password"
              disabled={isAdmin}
            />
          </div>
        </Card>

        <Card title="Notifications">
          <ToggleRow label="Email notifications" checked={notifyEmail} onChange={setNotifyEmail} disabled={isAdmin} />
          <ToggleRow label="Push notifications" checked={notifyPush} onChange={setNotifyPush} disabled={isAdmin} />
          <ToggleRow label="SMS notifications" checked={notifySms} onChange={setNotifySms} disabled={isAdmin} />
        </Card>

        {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}

        <div className="flex justify-end">
          <Button type="submit" disabled={isAdmin || pending}>
            {saved ? <Check className="size-4" /> : <Bell className="size-4" />}
            {saved ? 'Saved' : pending ? 'Saving…' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}
