// Hono
import { Hono } from 'hono'
const app = new Hono()

// Controllers
import { answerReviewsController, parseReviewsControllers } from './reviews.controllers'

app.post('/:pointId/reviews/parse', parseReviewsControllers)
app.post('/:pointId/reviews/answer', answerReviewsController)

export default app
