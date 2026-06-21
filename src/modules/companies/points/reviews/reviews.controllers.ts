// Hono
import { Context } from 'hono'

import { parseReviews } from './reviews.models'
import { answerReviewsQueue } from './worker/reviews.queue'

export async function parseReviewsControllers(c: Context) {
  try {
    const pointId = c.req.param('pointId')
    if (!pointId) {
      return c.json({ status: 400, success: false, message: 'Не найдено id точки' }, 500)
    }
    const intPointId = parseInt(pointId, 10)
    if (isNaN(intPointId)) {
      return c.json({ status: 400, success: false, message: 'ID точки неправильного формата' }, 500)
    }

    const result = await parseReviews(c.get('companyId'), intPointId)

    return c.json(result, result.status)
  } catch (error) {
    console.error('❌ [Company] Error occurred while getting company:', error)
    return c.json({ status: 500, success: false, message: 'Ошибка при парсинге отзывов' }, 500)
  }
}

export async function answerReviewsController(c: Context) {
  try {
    const pointId = c.req.param('pointId')
    if (!pointId) {
      return c.json({ status: 400, success: false, message: 'Не найдено id точки' }, 500)
    }
    const intPointId = parseInt(pointId, 10)
    if (isNaN(intPointId)) {
      return c.json({ status: 400, success: false, message: 'ID точки неправильного формата' }, 500)
    }

    await answerReviewsQueue.add('answer', {
      pointId: intPointId,
    })

    return c.json({
      status: 202,
      success: true,
      message: 'Запрос на написание ответов успешно принят!',
    })
  } catch (error) {
    console.error('❌ [Company] Error occurred while getting company:', error)
    return c.json({ status: 500, success: false, message: 'Ошибка при парсинге отзывов' }, 500)
  }
}
