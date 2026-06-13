import { notFound } from 'next/navigation'
import { CustomerDetail } from '@/components/customer/customer-detail'
import { customers } from '@/app/admin/customer/data'

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const customer = customers.find((c) => c.id === id)

  if (!customer) {
    notFound()
  }

  return <CustomerDetail customer={customer} />
}
