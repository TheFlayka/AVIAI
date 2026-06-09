// Hono
import { Context } from 'hono'

// Models
import { createCafe, getCafes } from './cafes.models'

export async function createCafeController(c: Context) {
  try {
    const result = await createCafe(await c.req.json(), c.get('userId'))
    return c.json(result, result.status)
  } catch (error) {
    console.error('❌ [Cafes] Error occurred while creating cafe:', error)
    return c.json({ status: 500, success: false, message: 'Ошибка при создании кафе' })
  }
}

export async function getCafesController(c: Context) {
  try {
    const result = await getCafes(c.get('userId'))
    return c.json(result, result.status)
  } catch (error) {
    console.error('❌ [Cafes] Error occurred while getting cafes:', error)
    return c.json({ status: 500, success: false, message: 'Ошибка при получений всех кафе' })
  }
}
