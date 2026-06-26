// Check our ENV(Important)
const JWT_SECRET = Bun.env.JWT_SECRET
if (!JWT_SECRET || JWT_SECRET.trim() === '') {
  console.error('❌ [CRITICAL] JWT_SECRET not found in environment variables')
  process.exit(1)
}
if (!Bun.env.GOOGLE_GENAI_API_KEY || Bun.env.GOOGLE_GENAI_API_KEY.trim() === '') {
  console.error('❌ [CRITICAL] GOOGLE_GENAI_API_KEY not found in environment variables')
  process.exit(1)
}
import '#lib/prisma'

// Hono
import { Hono } from 'hono'
import type { HonoBase } from 'hono/hono-base'

const app: HonoBase = new Hono()

const port = Bun.env.PORT
console.log(`🚀 [Main] HTTP server started on port ${port}!`)

// Workers
import '#modules/companies/points/worker/points.worker'
import '#modules/companies/points/reviews/worker/reviews.worker'
console.log(`[Main] All workers started!`)

// Routes
import usersRoutes from '#modules/users/users.routes'
import companiesRoutes from '#modules/companies/companies.routes'

app.route('/api/users', usersRoutes)
app.route('/api/companies', companiesRoutes)

export default {
  port,
  fetch: app.fetch,
}
