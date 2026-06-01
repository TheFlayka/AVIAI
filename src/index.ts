// Hono
import { Hono } from 'hono'
import type { HonoBase } from 'hono/hono-base'

// Routes
import usersRoutes from '#modules/users/users.routes'

const app: HonoBase = new Hono()

const port = 3000
console.log(`🚀 [Main] HTTP server started on port ${port}`)

app.route('/api/users', usersRoutes)

export default {
  port,
  fetch: app.fetch,
}
