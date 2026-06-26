// Prisma connection to interact with Database
import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../generated/prisma/client'

// Check DATABASE_URL in ENV
if (!Bun.env.DATABASE_URL || Bun.env.DATABASE_URL.trim() === '') {
  console.error('❌ [CRITICAL] DATABASE_URL not found in environment variables')
  process.exit(1)
}
const connectionString = `${Bun.env.DATABASE_URL}`

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

export { prisma }
