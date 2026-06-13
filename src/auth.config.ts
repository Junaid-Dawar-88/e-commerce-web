import type { NextAuthConfig } from 'next-auth'
import type { Role } from '@/lib/permissions'

// Edge-safe config (no providers/prisma) — shared by the full auth instance
// and by middleware so it can read the session at the edge.
export const authConfig = {
  trustHost: true,
  pages: {
    signIn: '/login',
  },
  providers: [],
  callbacks: {
    // Persist id + role + granted modules onto the JWT at sign-in.
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.modules = user.modules
      }
      return token
    },
    // Expose id + role + modules on the session for guards + middleware.
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as Role
        session.user.modules = (token.modules as string[] | undefined) ?? []
      }
      return session
    },
  },
} satisfies NextAuthConfig
