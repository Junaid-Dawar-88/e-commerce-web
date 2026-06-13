'use server'

import { sendMail } from '@/lib/email'

export type ContactState = {
  ok: boolean
  message: string
  // Echo back values so the form can repopulate on error.
  values?: { name: string; email: string; subject: string; message: string }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Escape user input before interpolating into the HTML email body.
function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function submitContact(
  _prevState: ContactState,
  formData: FormData
): Promise<ContactState> {
  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const subject = String(formData.get('subject') ?? '').trim()
  const message = String(formData.get('message') ?? '').trim()
  const values = { name, email, subject, message }

  if (!name || !email || !subject || !message) {
    return { ok: false, message: 'Please fill in every field.', values }
  }
  if (!EMAIL_RE.test(email)) {
    return { ok: false, message: 'Please enter a valid email address.', values }
  }
  if (message.length > 5000) {
    return { ok: false, message: 'Message is too long (5000 characters max).', values }
  }

  // Where contact submissions land. Falls back to the mailer's own address.
  const to =
    process.env.CONTACT_TO ??
    process.env.EMAIL_FROM ??
    process.env.SMTP_USER ??
    ''

  const safe = {
    name: escapeHtml(name),
    email: escapeHtml(email),
    subject: escapeHtml(subject),
    message: escapeHtml(message).replace(/\n/g, '<br/>'),
  }

  try {
    const { sent } = await sendMail({
      to,
      subject: `[Contact] ${subject}`,
      // replyTo isn't part of sendMail's signature; surface the sender in the body instead.
      text:
        `New contact form submission\n\n` +
        `Name: ${name}\n` +
        `Email: ${email}\n` +
        `Subject: ${subject}\n\n` +
        `${message}\n`,
      html:
        `<h2>New contact form submission</h2>` +
        `<p><strong>Name:</strong> ${safe.name}<br/>` +
        `<strong>Email:</strong> <a href="mailto:${safe.email}">${safe.email}</a><br/>` +
        `<strong>Subject:</strong> ${safe.subject}</p>` +
        `<p>${safe.message}</p>`,
    })

    if (!sent) {
      // SMTP not configured — log so the message isn't silently lost in dev.
      console.warn(
        `[contact] SMTP not configured — message from ${email} (${subject}) not delivered.`
      )
      return {
        ok: false,
        message:
          'Sorry, messaging is not configured right now. Please email us directly at hello@yourstore.com.',
        values,
      }
    }

    return {
      ok: true,
      message: "Thanks for reaching out! We'll get back to you within one business day.",
    }
  } catch (err) {
    console.error('[contact] failed to send message:', err)
    return {
      ok: false,
      message: 'Something went wrong sending your message. Please try again.',
      values,
    }
  }
}
