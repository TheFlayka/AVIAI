// Hono
import { Context } from 'hono'

// Queue
import { answerReviewsQueue } from './worker/reviews.queue'

// Models
import { getReviews, parseReviews } from './reviews.models'

export async function parseReviewsControllers(c: Context) {
  try {
    const pointId = c.req.param('pointId')
    if (!pointId) {
      return c.json({ status: 400, success: false, message: 'Не найдено id точки' }, 400)
    }
    const intPointId = parseInt(pointId, 10)
    if (isNaN(intPointId)) {
      return c.json({ status: 400, success: false, message: 'ID точки неправильного формата' }, 400)
    }

    const result = await parseReviews(c.get('companyId'), intPointId)

    return c.json(result, result.status)
  } catch (error) {
    console.error('❌ [Review] Error occurred while creating a job for parsing reviews:', error)
    return c.json(
      { status: 500, success: false, message: 'Ошибка при принятии парсинга отзывов' },
      500,
    )
  }
}

export async function answerReviewsController(c: Context) {
  try {
    const pointId = c.req.param('pointId')
    if (!pointId) {
      return c.json({ status: 400, success: false, message: 'Не найдено id точки' }, 400)
    }
    const intPointId = parseInt(pointId, 10)
    if (isNaN(intPointId)) {
      return c.json({ status: 400, success: false, message: 'ID точки неправильного формата' }, 400)
    }

    await answerReviewsQueue.add('answer_review', {
      pointId: intPointId,
    })

    return c.json({
      status: 202,
      success: true,
      message: 'Запрос на написание ответов успешно принят!',
    })
  } catch (error) {
    console.error('❌ [Review] Error occurred while creating a job for answering review:', error)
    return c.json(
      { status: 500, success: false, message: 'Ошибка при принятии написание ответов на отзывы' },
      500,
    )
  }
}

export async function getReviewsController(c: Context) {
  try {
    const pointId = c.req.param('pointId')
    if (!pointId) {
      return c.json({ status: 400, success: false, message: 'Не найдено id точки' }, 400)
    }
    const intPointId = parseInt(pointId, 10)
    if (isNaN(intPointId)) {
      return c.json({ status: 400, success: false, message: 'ID точки неправильного формата' }, 400)
    }

    const result = await getReviews(intPointId)
    return c.json(result, result.status)
  } catch (error) {
    console.error('❌ [Review] Error occurred while getting reviews:', error)
    return c.json(
      { status: 500, success: false, message: 'Ошибка при получении всех отзывов' },
      500,
    )
  }
}

export async function getReviewController(c: Context) {
  try {
    return c.json({
      success: true,
      status: 200,
      message: 'Отзыв найден и получен',
      data: c.get('review'),
    })
  } catch (error) {
    console.error('❌ [Review] Error occurred while getting reviews:', error)
    return c.json(
      { status: 500, success: false, message: 'Ошибка при получении всех отзывов' },
      500,
    )
  }
}
