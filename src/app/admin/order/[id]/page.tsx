import { notFound } from 'next/navigation'
import { getOrderById } from '@/services/order/order'
import { mapOrder } from '@/app/admin/order/data'
import { OrderDetail } from '@/components/order/order-detail'

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const row = await getOrderById(id)

  if (!row) {
    notFound()
  }

  return <OrderDetail order={mapOrder(row)} />
}
