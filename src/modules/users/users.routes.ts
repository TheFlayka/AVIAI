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
import { registerUserController } from './users.controllers'

app.post('/', sValidator('json', registrationSchema), registerUserController)
app.post('/profile/login', sValidator('json', loginSchema))
app.get('/profile')
app.put('/profile', sValidator('json', optionalRegistrationSchema))
app.put('/profile/password', sValidator('json', passwordSchema))
app.delete('/profile')
app.post('/profile/logout')
app.post('/profile/recovery')

export default app
