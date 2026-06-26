// Hono
import { Hono } from 'hono'
const app = new Hono()

// Controllers
import {
  answerReviewsController,
  getReviewsController,
  parseReviewsControllers,
  getReviewController,
} from './reviews.controllers'

// Middleware
import { findReviewMiddleware } from './reviews.middlewares'
app.use('/:pointId/reviews/:reviewId/*', findReviewMiddleware)

app.post('/:pointId/reviews/parse', parseReviewsControllers)
app.post('/:pointId/reviews/answer', answerReviewsController)
app.get('/:pointId/reviews', getReviewsController)
app.get('/:pointId/reviews/:reviewId', getReviewController)

export default app
