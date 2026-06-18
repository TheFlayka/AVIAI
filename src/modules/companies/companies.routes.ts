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
import { companySchema, optionalCompanySchema } from './companies.validations'

// Controllers
import {
  createCompanyController,
  deleteCompanyController,
  getCompaniesController,
  getCompanyController,
  recoveryCompanyController,
  updateCompanyController,
} from './companies.controllers'

// Companies Routes
app.post('/', sValidator('json', companySchema), createCompanyController)
app.get('/', getCompaniesController)
app.get('/:id', getCompanyController)
app.put('/:id', sValidator('json', optionalCompanySchema), updateCompanyController)
app.delete('/:id', deleteCompanyController)
app.post('/:id/recovery', recoveryCompanyController)

export default app
