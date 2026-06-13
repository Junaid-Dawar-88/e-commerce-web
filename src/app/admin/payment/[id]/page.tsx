import { notFound } from 'next/navigation'
import { PaymentDetail } from '@/components/payment/payment-detail'
import { payments } from '@/app/admin/payment/data'

export default async function PaymentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const payment = payments.find((p) => p.id === id)

  if (!payment) {
    notFound()
  }

  return <PaymentDetail payment={payment} />
}
