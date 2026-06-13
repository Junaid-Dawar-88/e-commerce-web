import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import { EmployeeDetail } from '@/components/employee/employee-detail'
import { mapEmployee } from '@/app/admin/employee/data'

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const row = await prisma.employee.findUnique({ where: { id } })

  if (!row) {
    notFound()
  }

  return <EmployeeDetail employee={mapEmployee(row)} />
}
