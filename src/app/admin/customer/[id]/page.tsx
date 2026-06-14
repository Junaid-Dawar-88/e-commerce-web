import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import { CustomerDetail } from '@/components/customer/customer-detail'
import { mapCustomerDetail } from '@/app/admin/customer/data'

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // The customer plus every order they've placed (newest first), with the
  // item count for each order.
  const row = await prisma.customer.findUnique({
    where: { id },
    include: {
      orders: {
        orderBy: { createdAt: 'desc' },
        include: { items: { select: { id: true } } },
      },
    },
  })

  if (!row) {
    notFound()
  }

  const reviews = await prisma.review.findMany({
    where: { customerId: id },
    select: { rating: true },
  })

  const { customer, orders } = mapCustomerDetail(row, reviews)

  return <CustomerDetail customer={customer} orders={orders} />
}
