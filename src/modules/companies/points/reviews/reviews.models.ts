import { prisma } from '#lib/prisma'

import { parsingReviewsQueue } from './worker/reviews.queue'

export const parseReviews = async (compId: number, pointId: number) => {
  try {
    const point = await prisma.companyPoint.findFirst({
      where: {
        companyId: compId,
        id: pointId,
      },
    })

    if (!point) {
      return {
        success: false,
        status: 404,
        message: 'Точка заведения не найдена',
      } as const
    }

    await parsingReviewsQueue.add('review', {
      yandexId: point.yandexId,
      pointId: pointId,
    })

    return {
      success: true,
      status: 202,
      message: 'Запрос на парсинг отзывов принят!',
    } as const
  } catch (error) {
    return {
      success: false,
      status: 500,
      message: 'Ошибка при создании задачи парсинга отзывов',
      error,
    } as const
  }
}
