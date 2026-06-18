// Hono
import { Hono } from 'hono'
import { sValidator } from '@hono/standard-validator'

const app = new Hono()

// Middlewares
import { authMiddleware } from '#shared/auth_middleware'
app.use('/*', authMiddleware)
import { findCompanyMiddleware } from './companies.middlewares'
app.use('/:id/*', findCompanyMiddleware)

// Schemas
import { companySchema } from './companies.validations'

// Controllers
import {
  createCompanyController,
  getCompaniesController,
  getCompanyController,
} from './companies.controllers'

// Companies Routes
app.post('/', sValidator('json', companySchema), createCompanyController)
app.get('/', getCompaniesController)
app.get('/:id', getCompanyController)
app.put('/:id')
app.delete('/:id')
app.post('/recovery/:id')

export default app
