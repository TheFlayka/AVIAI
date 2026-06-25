// Hono + sValidator
import { Hono } from 'hono'
import { sValidator } from '@hono/standard-validator'

const app = new Hono()

// Schemas
import {
  baseSchema,
  optionalUserSchema,
  passwordSchema,
  registrationSchema,
} from './users.validations'

// Controllers
import {
  changePasswordUserController,
  changeUserController,
  deleteUserController,
  getUserController,
  loginUserController,
  logoutUserController,
  recoveryUserController,
  registerUserController,
} from './users.controllers'

// Middlewares
import { authMiddleware } from '#shared/auth_middleware'
app.use('/profile/*', authMiddleware)

// Create and Login User
app.post('/', sValidator('json', registrationSchema), registerUserController)
app.post('/profile/login', sValidator('json', baseSchema), loginUserController)

// Get User, Change User, Change Password, Logout, Recovery
app.get('/profile', getUserController)
app.put('/profile', sValidator('json', optionalUserSchema), changeUserController)
app.put('/profile/password', sValidator('json', passwordSchema), changePasswordUserController)
app.post('/profile/logout', logoutUserController)
app.delete('/profile', deleteUserController)
app.post('/profile/recovery', sValidator('json', baseSchema), recoveryUserController)

export default app
