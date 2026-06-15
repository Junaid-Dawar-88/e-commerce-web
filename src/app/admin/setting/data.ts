// Store-wide settings. Persisted as a single JSON row in Neon — see
// `src/services/setting/setting.ts`. The shape here is the source of truth and
// the fallback when a key hasn't been saved yet.

export const DEFAULT_SETTINGS = {
  storeName: 'ShoeMart',
  email: 'support@shoemart.com',
  phone: '+92 300 1234567',
  currency: 'USD',
  timezone: 'GMT+5',
  language: 'en',
  storeActive: true,
  guestCheckout: true,
  minOrder: '10',
  maxOrder: '5000',
  productApproval: 'auto',
  methods: { Stripe: true, PayPal: true, Easypaisa: true, JazzCash: true },
  // Manual bank/wallet transfer accounts shown at checkout. The customer
  // transfers to the enabled accounts that have a number/IBAN filled in, then
  // enters the Transaction ID; staff verify it and mark the order paid.
  manualPayments: {
    jazzcash: { enabled: true, title: '', number: '' },
    easypaisa: { enabled: true, title: '', number: '' },
    sadapay: { enabled: true, title: '', iban: '' },
    bank: { enabled: true, bankName: '', title: '', number: '', iban: '' },
  },
  stripeKey: 'pk_live_51Hxxxxxxxxxxxx',
  stripeSecret: 'sk_live_51Hxxxxxxxxxxxx',
  commission: '10',
  autoRefund: false,
  notify: { email: true, push: true, sms: false },
  events: { 'New Order': true, Payment: true, Refund: true, 'Low Stock': true },
  twoFA: true,
  sessionTimeout: '30',
  passwordPolicy: 'strong',
  rateLimiting: true,
  shipping: { standard: '5', express: '10', sameDay: '20' },
  // Delivery charge applied at checkout and shown to the customer.
  // `freeOver` of '0' means always charge; otherwise free once the subtotal
  // reaches that amount.
  delivery: { enabled: true, fee: '5', freeOver: '0' },
  taxEnabled: true,
  taxRate: '15',
  regionBased: true,
  theme: 'system' as 'light' | 'dark' | 'system',
  primary: '#000000',
  accent: '#F97316',
}

export type StoreSettings = typeof DEFAULT_SETTINGS

// Merge a stored (possibly partial / older) blob over the defaults so missing
// keys always resolve to a sensible value.
export function withDefaults(stored: Partial<StoreSettings> | null | undefined): StoreSettings {
  return { ...DEFAULT_SETTINGS, ...(stored ?? {}) }
}
