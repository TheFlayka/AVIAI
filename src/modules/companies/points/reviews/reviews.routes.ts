// Hono
import { Hono } from 'hono'
import { sValidator } from '@hono/standard-validator'
const app = new Hono()

// Controllers
import {
  answerReviewsController,
  getReviewsController,
  parseReviewsControllers,
  getReviewController,
  changeReviewController,
} from './reviews.controllers'

// Schemas
import { answerSchema } from './reviews.validations'

// Middleware
import { findReviewMiddleware } from './reviews.middlewares'
app.use('/:pointId/reviews/:reviewId/*', findReviewMiddleware)

app.post('/:pointId/reviews/parse', parseReviewsControllers)
app.post('/:pointId/reviews/answer', answerReviewsController)
app.get('/:pointId/reviews', getReviewsController)
app.get('/:pointId/reviews/:reviewId', getReviewController)
app.put('/:pointId/reviews/:reviewId', sValidator('json', answerSchema), changeReviewController)

export default app
