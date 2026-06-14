import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import { PaymentDetail } from '@/components/payment/payment-detail'
import { mapPayment } from '@/app/admin/payment/data'

export default async function PaymentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  // A payment is an order — look it up with its customer for the receipt.
  const row = await prisma.order.findUnique({
    where: { id },
    include: { customer: true, items: true },
  })

  if (!row) {
    notFound()
  }

  return <PaymentDetail payment={mapPayment(row)} />
}
