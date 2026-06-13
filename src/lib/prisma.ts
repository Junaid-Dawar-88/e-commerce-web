import { PrismaClient } from '@/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

// Neon's free tier auto-suspends the database after a few minutes idle. The
// first query after that has to wake the compute back up, which can briefly
// fail to connect (Prisma error P1001). We tune the pool to recycle stale
// connections and retry transient connectivity errors so the waking query
// succeeds instead of erroring out.
const adapter = new PrismaPg(
  {
    connectionString: process.env.DATABASE_URL!,
    max: 5,
    // Close idle clients before Neon kills them server-side.
    idleTimeoutMillis: 10_000,
    // Give a suspended Neon compute time to resume on connect.
    connectionTimeoutMillis: 20_000,
    keepAlive: true,
  },
  {
    // Without these listeners, an idle-connection error can crash the dev server.
    onPoolError: (err) => console.warn('[prisma] pool error:', err.message),
    onConnectionError: (err) => console.warn('[prisma] connection error:', err.message),
  }
)

// Connectivity errors that are safe to retry (the query never ran).
const TRANSIENT =
  /P1001|reach database|DatabaseNotReachable|Connection terminated|ECONNRESET|ETIMEDOUT|socket hang up/i

function isTransient(error: unknown): boolean {
  if ((error as { code?: string })?.code === 'P1001') return true
  const message = error instanceof Error ? error.message : String(error)
  return TRANSIENT.test(message)
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function createPrismaClient() {
  return new PrismaClient({ adapter }).$extends({
    query: {
      async $allOperations({ args, query }) {
        let lastError: unknown
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            return await query(args)
          } catch (error) {
            lastError = error
            if (!isTransient(error)) throw error
            // Likely Neon waking from sleep — back off and try again.
            await sleep(800 * (attempt + 1))
          }
        }
        throw lastError
      },
    },
  })
}

type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>

const globalForPrisma = globalThis as unknown as { prisma?: ExtendedPrismaClient }

const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
