import type { NextRequest } from 'next/server'
import { handlers } from '@/auth'

// Next 16 / Turbopack here only detects route handlers exported as named
// function declarations — `export const { GET, POST } = handlers` is invisible
// to its analysis, so the route silently 404s. Delegate via explicit functions.
export async function GET(request: NextRequest) {
  return handlers.GET(request)
}

export async function POST(request: NextRequest) {
  return handlers.POST(request)
}
