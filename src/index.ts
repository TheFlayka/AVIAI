// Hono
import { Hono } from 'hono'
import type { HonoBase } from 'hono/hono-base'

// Routes
import usersRoutes from '#modules/users/users.routes'
import companiesRoutes from '#modules/companies/companies.routes'

const app: HonoBase = new Hono()

const port = 3000
console.log(`🚀 [Main] HTTP server started on port ${port}`)

// Turn on worker
import '#modules/companies/points/worker/points.worker'
import '#modules/companies/points/reviews/worker/reviews.worker'
console.log(`[Main] Workers started`)

// Routes
app.route('/api/users', usersRoutes)
app.route('/api/companies', companiesRoutes)

export default {
  port,
  fetch: app.fetch,
}
