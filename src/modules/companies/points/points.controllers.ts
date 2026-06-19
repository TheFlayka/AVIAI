// Hono
import { Context } from 'hono'

// Queue
import { createPointQueue } from './worker/points.queue'
import { getPoints } from './points.models'

export async function createPointsController(c: Context) {
  try {
    await createPointQueue.add('parse_map', {
      yandexMapsUrl: c.get('company').yandexMapsUrl,
      companyId: c.get('companyId'),
    })

    return c.json(
      { status: 202, success: true, message: 'Запрос на импорт точек успешно принят' },
      202,
    )
  } catch (error) {
    console.error('❌ [Points] Error occurred while importing points:', error)
    return c.json({ status: 500, success: false, message: 'Ошибка при импорте точек' }, 500)
  }
}

export async function getPointsController(c: Context) {
  try {
    const result = await getPoints(c.get('companyId'))
    return c.json(result, result.status)
  } catch (error) {
    console.error('❌ [Points] Error occurred while importing points:', error)
    return c.json({ status: 500, success: false, message: 'Ошибка при импорте точек' }, 500)
  }
}
