// Hono
import { Context } from 'hono'

// Models
import { createCompany, getCompanies, updateCompany } from './companies.models'

export async function createCompanyController(c: Context) {
  try {
    const result = await createCompany(await c.req.json(), c.get('userId'))
    return c.json(result, result.status)
  } catch (error) {
    console.error('❌ [Company] Error occurred while creating company:', error)
    return c.json({ status: 500, success: false, message: 'Ошибка при создании заведения' }, 500)
  }
}

export async function getCompaniesController(c: Context) {
  try {
    const result = await getCompanies(c.get('userId'))
    return c.json(result, result.status)
  } catch (error) {
    console.error('❌ [Company] Error occurred while getting companies:', error)
    return c.json(
      { status: 500, success: false, message: 'Ошибка при получений всех заведений' },
      500,
    )
  }
}

export async function getCompanyController(c: Context) {
  try {
    return c.json(
      { status: 200, success: true, message: 'Заведение успешно получено', data: c.get('company') },
      200,
    )
  } catch (error) {
    console.error('❌ [Company] Error occurred while getting company:', error)
    return c.json({ status: 500, success: false, message: 'Ошибка при получений заведения' }, 500)
  }
}

export async function updateCompanyController(c: Context) {
  try {
    const result = await updateCompany(c.get('company'), c.get('companyId'), await c.req.json())
    return c.json(result, result.status)
  } catch (error) {
    console.error('❌ [Company] Error occurred while updating company:', error)
    return c.json({ status: 500, success: false, message: 'Ошибка при обновлений заведения' }, 500)
  }
}
