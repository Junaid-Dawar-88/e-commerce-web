// View-model types for the employee UI, plus a mapper from the Prisma row.
// The actual data now lives in PostgreSQL (see prisma/schema.prisma).

export type EmployeeStatus = 'active' | 'on_leave' | 'inactive'

// Permission preset assigned by the admin (matches the Prisma enum values).
export type EmployeeAccess = 'manager' | 'staff'

// Shape consumed by the UI components.
export type Employee = {
  id: string
  name: string
  email: string
  phone: string
  role: string
  department: string
  access: EmployeeAccess
  permissions: string[]
  status: EmployeeStatus
  joined: string // short, e.g. "Jan 25"
  joinedLong: string // e.g. "10 Jan 2025"
  daysAgo: number
  salary: number
  city: string
  state: string
  country: string
}

// Shape of a row coming back from Prisma / the API.
export type EmployeeRow = {
  id: string
  name: string
  email: string
  phone: string
  role: string
  department: string
  access: EmployeeAccess
  permissions: string[]
  status: EmployeeStatus
  salary: number
  city: string
  state: string
  country: string
  createdAt: Date | string
}

const MS_PER_DAY = 1000 * 60 * 60 * 24

// Derive the display fields from the row's createdAt timestamp.
export function mapEmployee(row: EmployeeRow): Employee {
  const joined = new Date(row.createdAt)
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    role: row.role,
    department: row.department,
    access: row.access,
    permissions: row.permissions ?? [],
    status: row.status,
    joined: joined.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    joinedLong: joined.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    daysAgo: Math.max(0, Math.floor((Date.now() - joined.getTime()) / MS_PER_DAY)),
    salary: row.salary,
    city: row.city,
    state: row.state,
    country: row.country,
  }
}
