import { config } from 'dotenv'
import { defineConfig, env } from 'prisma/config'

// Load env for Prisma CLI commands. Supports either .env.local or .env
// (whichever exists); .env.local wins when both are present.
config({ path: '.env.local' })
config({ path: '.env' })

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    // Migrations use the direct (unpooled) Neon connection.
    url: env('DATABASE_URL_UNPOOLED'),
  },
})
