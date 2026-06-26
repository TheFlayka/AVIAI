// Hono
import { Hono } from 'hono'
const app = new Hono()

// Controllers
import {
  answerReviewsController,
  getReviewsController,
  parseReviewsControllers,
} from './reviews.controllers'

app.post('/:pointId/reviews/parse', parseReviewsControllers)
app.post('/:pointId/reviews/answer', answerReviewsController)
app.get('/:pointId/reviews', getReviewsController)

export default app
