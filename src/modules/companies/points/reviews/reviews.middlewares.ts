// Hono
import { Context, type Next } from 'hono'

// Prisma
import { prisma } from '#lib/prisma'

export async function findReviewMiddleware(c: Context, next: Next) {
  try {
    // ID(get, check, int)
    const id = c.req.param('reviewId')
    if (!id) {
      return c.json(
        {
          status: 400,
          success: false,
          message: 'Не указан ID отзыва',
        },
        400,
      )
    }
    // Make it to Int
    const reviewIdNum = parseInt(id, 10)
    if (isNaN(reviewIdNum)) {
      return c.json({ success: false, status: 400, message: 'ID отзыва должно быть числом' }, 400)
    }

    // Find review in DB
    const review = await prisma.review.findFirst({
      where: {
        id: reviewIdNum,
      },
    })
    if (!review) {
      return c.json(
        {
          success: false,
          status: 404,
          message: 'Не удалось найти отзыв',
        },
        404,
      )
    }

    ;(c.set('reviewId', reviewIdNum), c.set('review', review))

    await next()
  } catch (error) {
    console.error('❌ [Find review middleware]:', error)
    return c.json(
      {
        success: false,
        status: 500,
        message: 'Произошла внутренняя ошибка при проверке отзыва',
      },
      500,
    )
  }
}
