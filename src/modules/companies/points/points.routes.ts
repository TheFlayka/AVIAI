// Hono
import { Hono } from 'hono'
const app = new Hono()

// Controllers
import {
  createPointsController,
  getPointController,
  getPointsController,
} from './points.controllers'

app.post('/', createPointsController)
app.get('/', getPointsController)
app.get('/:pointId', getPointController)

export default app
