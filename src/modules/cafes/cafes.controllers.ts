// Hono
import { Context } from 'hono'

// Models
import { createCafe, getCafeById, getCafes } from './cafes.models'

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

export async function getCafeController(c: Context) {
  try {
    // Check if there id
    const id = c.req.param('id')
    if (!id) {
      return c.json(
        {
          status: 400,
          success: false,
          message: 'Не указан ID заведения',
        },
        400,
      )
    }

    // Parse id to number
    const cafeIdNum = parseInt(id, 10)
    if (isNaN(cafeIdNum)) {
      return c.json({ success: false, message: 'ID должен быть числом' }, 400)
    }

    const result = await getCafeById(c.get('userId'), cafeIdNum)
    return c.json(result, result.status)
  } catch (error) {
    console.error('❌ [Cafes] Error occurred while getting cafe:', error)
    return c.json({ status: 500, success: false, message: 'Ошибка при получений кафе' })
  }
}
