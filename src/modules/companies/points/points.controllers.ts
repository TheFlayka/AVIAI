// Hono
import { Context } from 'hono'

// Queue
import { syncPointsQueue } from './worker/points.queue'

// Models
import { getPoint, getPoints } from './points.models'

export async function syncPointsController(c: Context) {
  try {
    await syncPointsQueue.add('parse_and_sync', {
      yandexMapsUrl: c.get('company').yandexMapsUrl,
      companyId: c.get('companyId'),
    })

    return c.json(
      { status: 202, success: true, message: 'Запрос на синхронизацию точек успешно принят' },
      202,
    )
  } catch (error) {
    console.error('❌ [Points] Error occurred while syncing points:', error)
    return c.json({ status: 500, success: false, message: 'Ошибка при синхронизаций точек' }, 500)
  }
}

export async function getPointsController(c: Context) {
  try {
    const result = await getPoints(c.get('companyId'))
    return c.json(result, result.status)
  } catch (error) {
    console.error('❌ [Points] Error occurred while getting points:', error)
    return c.json({ status: 500, success: false, message: 'Ошибка при получений точек' }, 500)
  }
}

export async function getPointController(c: Context) {
  try {
    const id = c.req.param('pointId')
    if (!id) {
      return c.json({ status: 400, success: false, message: 'Не введен id точки заведения' }, 400)
    }
    // Make it to Int
    const companyIdNum = parseInt(id, 10)
    if (isNaN(companyIdNum)) {
      return c.json(
        { success: false, status: 400, message: 'ID точки заведения должно быть числом' },
        400,
      )
    }

    const result = await getPoint(c.get('companyId'), companyIdNum)
    return c.json(result, result.status)
  } catch (error) {
    console.error('❌ [Points] Error occurred while getting point:', error)
    return c.json({ status: 500, success: false, message: 'Ошибка при получении точки' }, 500)
  }
}
