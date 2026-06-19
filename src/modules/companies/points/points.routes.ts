// Hono
import { Hono } from 'hono'
const app = new Hono()

// Controllers
import { createPointsController, getPointsController } from './points.controllers'

app.post('/', createPointsController)
app.get('/', getPointsController)

export default app
