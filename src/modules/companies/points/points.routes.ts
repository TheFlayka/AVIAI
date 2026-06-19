// Hono
import { Hono } from 'hono'
const app = new Hono()

// Controllers
import { createPointsController } from './points.controller'

app.post('/', createPointsController)

export default app
