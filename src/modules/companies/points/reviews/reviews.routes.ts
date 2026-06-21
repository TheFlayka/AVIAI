// Hono
import { Hono } from 'hono'
const app = new Hono()

// Controllers
import { parseReviewsControllers } from './reviews.controllers'

app.post('/:pointId/reviews/parse', parseReviewsControllers)

export default app
