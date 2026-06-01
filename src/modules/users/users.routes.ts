// Hono + sValidator
import { Hono } from 'hono'
import { sValidator } from '@hono/standard-validator'

const app = new Hono()

// Schemas
import {
  loginSchema,
  optionalRegistrationSchema,
  passwordSchema,
  registrationSchema,
} from './users.validations'

// Controllers
import {
  changeUserController,
  getUserController,
  loginUserController,
  registerUserController,
} from './users.controllers'

// Middlewares
import { authMiddleware } from './users.middlewares'

app.post('/', sValidator('json', registrationSchema), registerUserController)
app.use('/profile/*', authMiddleware)

app.post('/profile/login', sValidator('json', loginSchema), loginUserController)
app.get('/profile', getUserController)
app.put('/profile', sValidator('json', optionalRegistrationSchema), changeUserController)
app.put('/profile/password', sValidator('json', passwordSchema))
app.delete('/profile')
app.post('/profile/logout')
app.post('/profile/recovery')

export default app
