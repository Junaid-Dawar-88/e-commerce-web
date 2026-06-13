import type { Metadata } from "next"
import Link from "next/link"
import { CheckCircle2, Package } from "lucide-react"

import { getOrdersByCustomer } from "@/services/order/order"
import { getCurrentUser } from "@/lib/rbac"
import { formatPrice } from "@/lib/format"
import type { OrderStatus } from "@/types/order"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "My orders — Your Store",
}

export const dynamic = "force-dynamic"

// Fulfilment stages in order; `cancelled` is handled separately.
const STAGES: OrderStatus[] = ["pending", "processing", "shipped", "delivered"]

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
}

const STATUS_VARIANT: Record<
  OrderStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  pending: "secondary",
  processing: "default",
  shipped: "default",
  delivered: "default",
  cancelled: "destructive",
}

const PAYMENT_LABEL: Record<string, string> = {
  paid: "Paid",
  cod: "Cash on delivery",
  unpaid: "Awaiting payment",
  refunded: "Refunded",
}

export default async function AccountOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ placed?: string }>
}) {
  const { placed } = await searchParams
  const user = await getCurrentUser()

  if (!user) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-6 py-24 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Sign in to see your orders</h1>
        <Button asChild size="lg" className="mt-2 h-11 px-6 text-base">
          <Link href="/login?callbackUrl=/account/orders">Sign in</Link>
        </Button>
      </div>
    )
  }

  if (user.role !== "user") {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-6 py-24 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Team account</h1>
        <p className="text-muted-foreground">
          Manage all customer orders from the admin dashboard.
        </p>
        <Button asChild size="lg" className="mt-2 h-11 px-6 text-base">
          <Link href="/admin/order">Go to orders</Link>
        </Button>
      </div>
    )
  }

  const orders = await getOrdersByCustomer(user.id)

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight md:text-4xl">My orders</h1>
      <p className="mt-2 text-muted-foreground">
        Track the status of every order you&apos;ve placed.
      </p>

      {placed && (
        <div className="mt-6 flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
          <CheckCircle2 className="size-5 text-primary" />
          <span>
            Thanks! Your order has been placed and sent to our team to process.
          </span>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-4 rounded-xl border border-dashed border-border py-20 text-center">
          <div className="grid size-14 place-items-center rounded-full bg-muted text-muted-foreground">
            <Package className="size-7" />
          </div>
          <p className="text-muted-foreground">You haven&apos;t placed any orders yet.</p>
          <Button asChild size="lg" className="h-11 px-6 text-base">
            <Link href="/shop">Start shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 space-y-5">
          {orders.map((order) => {
            const status = order.status as OrderStatus
            const cancelled = status === "cancelled"
            const currentStage = STAGES.indexOf(status)

            return (
              <Card key={order.id} className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="font-mono text-xs text-muted-foreground">
                      #{order.id.slice(-8).toUpperCase()}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={STATUS_VARIANT[status]}>
                      {STATUS_LABEL[status]}
                    </Badge>
                    <Badge variant="outline">
                      {PAYMENT_LABEL[order.paymentStatus] ?? order.paymentStatus}
                    </Badge>
                  </div>
                </div>

                {/* Status tracker */}
                {!cancelled && (
                  <div className="mt-6 flex items-center">
                    {STAGES.map((stage, index) => {
                      const reached = index <= currentStage
                      return (
                        <div key={stage} className="flex flex-1 items-center last:flex-none">
                          <div className="flex flex-col items-center gap-1.5">
                            <div
                              className={
                                reached
                                  ? "grid size-7 place-items-center rounded-full bg-primary text-primary-foreground"
                                  : "grid size-7 place-items-center rounded-full border border-border text-muted-foreground"
                              }
                            >
                              {reached ? (
                                <CheckCircle2 className="size-4" />
                              ) : (
                                <span className="size-2 rounded-full bg-current" />
                              )}
                            </div>
                            <span
                              className={
                                reached
                                  ? "text-xs font-medium"
                                  : "text-xs text-muted-foreground"
                              }
                            >
                              {STATUS_LABEL[stage]}
                            </span>
                          </div>
                          {index < STAGES.length - 1 && (
                            <div
                              className={
                                index < currentStage
                                  ? "mx-2 h-0.5 flex-1 bg-primary"
                                  : "mx-2 h-0.5 flex-1 bg-border"
                              }
                            />
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Items */}
                <ul className="mt-6 space-y-2 border-t border-border/60 pt-4 text-sm">
                  {order.items.map((item) => (
                    <li key={item.id} className="flex justify-between gap-3">
                      <span className="min-w-0">
                        <span className="line-clamp-1">{item.name}</span>
                        <span className="text-muted-foreground">
                          {item.variant ? `Size ${item.variant} · ` : ""}Qty {item.qty}
                        </span>
                      </span>
                      <span className="shrink-0 font-medium">
                        {formatPrice(Number(item.price) * item.qty)}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 flex justify-between border-t border-border/60 pt-4 font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(order.amount)}</span>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
