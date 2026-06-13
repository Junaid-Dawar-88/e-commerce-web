import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import Sidebar from '@/components/sidebar'

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="flex h-screen bg-muted/40">
      <Sidebar user={session.user} />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  )
}
