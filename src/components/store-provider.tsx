'use client'

import { createContext, useContext } from 'react'
import { formatMoney } from '@/lib/money'

// Store identity + active currency, seeded from Settings by the admin layout
// and shared with every client component below it.
export type StoreInfo = {
  currency: string
  storeName: string
  email: string
  phone: string
}

const DEFAULT: StoreInfo = {
  currency: 'USD',
  storeName: 'My Store',
  email: '',
  phone: '',
}

const StoreContext = createContext<StoreInfo>(DEFAULT)

export function StoreProvider({
  value,
  children,
}: {
  value: StoreInfo
  children: React.ReactNode
}) {
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreInfo {
  return useContext(StoreContext)
}

// A currency formatter bound to the active store currency.
export function useMoney(opts?: Intl.NumberFormatOptions): (n: number) => string {
  const { currency } = useStore()
  return (n: number) => formatMoney(n, currency, opts)
}
