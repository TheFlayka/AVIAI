// Hono
import { Hono } from 'hono'
import { sValidator } from '@hono/standard-validator'

const app = new Hono()

// Middlewares
import { authMiddleware } from '#shared/auth_middleware'
app.use('/*', authMiddleware)

// Schemas
import { cafeSchema } from './cafes.validations'

// Controllers
import { createCafeController } from './cafes.controllers'

// Cafe Routes
app.post('/', sValidator('json', cafeSchema), createCafeController)

export default app
