// Hono
import { Hono } from 'hono'
const app = new Hono()

// Controllers
import { syncPointsController, getPointController, getPointsController } from './points.controllers'

// Reviews routes
import reviewRoutes from './reviews/reviews.routes'
app.route('/', reviewRoutes)
// Routes
app.post('/', syncPointsController)
app.get('/', getPointsController)
app.get('/:pointId', getPointController)

export default app
