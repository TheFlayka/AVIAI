// Hono
import { Hono } from 'hono'
import type { HonoBase } from 'hono/hono-base'

// Routes
import usersRoutes from '#modules/users/users.routes'
import cafesRoutes from '#modules/cafes/cafes.routes'

const app: HonoBase = new Hono()

const port = 3000
console.log(`🚀 [Main] HTTP server started on port ${port}`)

app.route('/api/users', usersRoutes)
app.route('/api/cafes', cafesRoutes)

export default {
  port,
  fetch: app.fetch,
}
