'use server'

import { signOut } from '@/auth'

// Server action sign-out — the reliable App Router pattern in NextAuth v5.
export async function signOutAction() {
  await signOut({ redirectTo: '/login' })
}
