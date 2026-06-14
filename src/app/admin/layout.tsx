import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/rbac'
import { getTheme } from '@/services/account/account'
import { getSettings } from '@/services/setting/setting'
import Sidebar from '@/components/sidebar'
import { StoreProvider } from '@/components/store-provider'

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  // The user's saved theme + the store name both come from Neon.
  const [theme, settings] = await Promise.all([getTheme(user), getSettings()])

  return (
    <StoreProvider
      value={{
        currency: settings.currency,
        storeName: settings.storeName,
        email: settings.email,
        phone: settings.phone,
      }}
    >
      <div className="flex h-screen bg-muted/40">
        <Sidebar user={user} initialTheme={theme} storeName={settings.storeName} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </StoreProvider>
  )
}
