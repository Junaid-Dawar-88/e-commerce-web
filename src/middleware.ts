import NextAuth from 'next-auth'
import { NextResponse } from 'next/server'
import { authConfig } from '@/auth.config'
import { canAccessPath } from '@/lib/permissions'

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { pathname } = req.nextUrl

  // Not logged in → send to login.
  if (!req.auth) {
    return NextResponse.redirect(new URL('/login', req.nextUrl.origin))
  }

  const role = req.auth.user?.role
  const modules = req.auth.user?.modules

  // Logged in but not allowed on this page → bounce to a page they can see.
  if (!canAccessPath(role, modules, pathname)) {
    const fallback = canAccessPath(role, modules, '/admin/dashboard')
      ? '/admin/dashboard'
      : '/login'
    if (pathname !== fallback) {
      return NextResponse.redirect(new URL(fallback, req.nextUrl.origin))
    }
  }

  return NextResponse.next()
})

// Only guard the admin area.
export const config = {
  matcher: ['/admin/:path*'],
}
