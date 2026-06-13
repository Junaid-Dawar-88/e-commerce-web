'use client'

import { useActionState } from 'react'
import { CheckCircle2 } from 'lucide-react'

import { submitContact, type ContactState } from '@/app/actions/contact'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/input'

const initialState: ContactState = { ok: false, message: '' }

export function ContactForm() {
  const [state, formAction, pending] = useActionState(
    submitContact,
    initialState
  )

  if (state.ok) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
        <div className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
          <CheckCircle2 className="size-6" />
        </div>
        <h3 className="text-lg font-semibold">Message sent</h3>
        <p className="max-w-sm text-sm text-muted-foreground">{state.message}</p>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-5">
      {state.message && !state.ok && (
        <p
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {state.message}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            placeholder="Jane Doe"
            defaultValue={state.values?.name}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="jane@example.com"
            defaultValue={state.values?.email}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject">Subject</Label>
        <Input
          id="subject"
          name="subject"
          placeholder="How can we help?"
          defaultValue={state.values?.subject}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <textarea
          id="message"
          name="message"
          rows={5}
          placeholder="Tell us a bit more…"
          defaultValue={state.values?.message}
          required
          className="w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
        />
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={pending}
        className="h-11 w-full text-base"
      >
        {pending ? 'Sending…' : 'Send message'}
      </Button>
    </form>
  )
}
