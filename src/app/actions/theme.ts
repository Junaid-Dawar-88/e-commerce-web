'use server'

import { getCurrentUser } from '@/lib/rbac'
import { setTheme } from '@/services/account/account'
import { isTheme, type Theme } from '@/lib/theme'

// Persist the signed-in user's theme choice to Neon.
export async function setThemeAction(theme: Theme): Promise<void> {
  if (!isTheme(theme)) return
  const user = await getCurrentUser()
  if (!user) return
  await setTheme(user, theme)
}
