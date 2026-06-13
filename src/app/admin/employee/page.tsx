import prisma from '@/lib/prisma'
import { EmployeesView } from '@/components/employee/employees-view'
import { mapEmployee } from './data'

export default async function EmployeesPage() {
  const rows = await prisma.employee.findMany({ orderBy: { createdAt: 'desc' } })
  const employees = rows.map(mapEmployee)

  return <EmployeesView initialEmployees={employees} />
}
