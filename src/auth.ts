import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import prisma from '@/lib/prisma'
import type { Role } from '@/lib/permissions'
import { effectiveModules } from '@/lib/permissions'
import { verifyPassword } from '@/lib/password'
import { authConfig } from '@/auth.config'

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        const email = credentials?.email ? String(credentials.email) : ''
        const password = credentials?.password ? String(credentials.password) : ''

        // 1) Admin from the env — full access.
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
          return {
            id: 'admin',
            name: 'Admin',
            email,
            role: 'admin' as Role,
            modules: effectiveModules('admin'),
          }
        }

        // 2) Employee from the database — role is the preset, modules are the
        //    admin's per-employee grant (falling back to the preset defaults).
        const employee = await prisma.employee.findUnique({ where: { email } })
        if (employee && verifyPassword(password, employee.password)) {
          const role = employee.access as Role
          return {
            id: employee.id,
            name: employee.name,
            email: employee.email,
            role,
            modules: effectiveModules(role, employee.permissions),
          }
        }

        // 3) Signed-up customer — role "user" (browse products, own orders).
        const customer = await prisma.customer.findUnique({ where: { email } })
        if (customer && customer.password && verifyPassword(password, customer.password)) {
          return {
            id: customer.id,
            name: customer.name,
            email: customer.email,
            role: 'user' as Role,
            modules: [],
          }
        }

        // Returning null tells NextAuth the credentials are invalid.
        return null
      },
    }),
  ],
})
