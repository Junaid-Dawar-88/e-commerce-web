import type { Metadata } from "next"
import { Clock, Mail, MapPin, Sparkles } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { ContactForm } from "@/components/marketing/contact-form"

export const metadata: Metadata = {
  title: "Contact — Your Store",
  description:
    "Get in touch with the Your Store team. We typically reply within one business day.",
}

const details = [
  {
    icon: Mail,
    title: "Email us",
    value: "hello@yourstore.com",
  },
  {
    icon: Clock,
    title: "Response time",
    value: "Within 1 business day",
  },
  {
    icon: MapPin,
    title: "Office",
    value: "Remote-first, worldwide",
  },
]

export default function ContactPage() {
  return (
    <>
      {/* Header */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,color-mix(in_oklch,var(--primary),transparent_88%),transparent)]"
        />
        <div className="mx-auto max-w-3xl px-6 py-20 text-center md:py-28">
          <Badge variant="secondary" className="mb-6">
            <Sparkles className="fill-current" />
            We&apos;d love to hear from you
          </Badge>
          <h1 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">
            Get in touch
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-lg text-muted-foreground">
            Questions about plans, a demo, or just want to say hello? Send us a
            note and we&apos;ll get back to you.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          {/* Details */}
          <div className="space-y-4">
            {details.map((detail) => (
              <Card key={detail.title} className="flex-row items-center gap-4 p-5">
                <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <detail.icon className="size-5" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    {detail.title}
                  </div>
                  <div className="font-medium">{detail.value}</div>
                </div>
              </Card>
            ))}
          </div>

          {/* Form */}
          <Card className="p-6 md:p-8">
            <ContactForm />
          </Card>
        </div>
      </section>
    </>
  )
}
