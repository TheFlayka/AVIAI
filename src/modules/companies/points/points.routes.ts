// Hono
import { Hono } from 'hono'
const app = new Hono()

// Controllers
import { syncPointsController, getPointController, getPointsController } from './points.controllers'

app.post('/', syncPointsController)
app.get('/', getPointsController)
app.get('/:pointId', getPointController)

export default app
