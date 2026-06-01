// Hono + sValidator
import { Hono } from 'hono'
import { sValidator } from '@hono/standard-validator'

const app = new Hono()

// Schemas
import {
  loginSchema,
  optionalUserSchema,
  passwordSchema,
  registrationSchema,
} from './users.validations'

// Controllers
import {
  changePasswordUserController,
  changeUserController,
  getUserController,
  loginUserController,
  registerUserController,
} from './users.controllers'

// Middlewares
import { authMiddleware } from './users.middlewares'

// Create and Login User
app.post('/', sValidator('json', registrationSchema), registerUserController)
app.post('/profile/login', sValidator('json', loginSchema), loginUserController)

// Auth Middleware
app.use('/profile/*', authMiddleware)

// Get User, Change User, Change Password, Logout, Recovery
app.get('/profile', getUserController)
app.put('/profile', sValidator('json', optionalUserSchema), changeUserController)
app.put('/profile/password', sValidator('json', passwordSchema), changePasswordUserController)
app.post('/profile/logout')
app.delete('/profile')
app.post('/profile/recovery')

export default app
