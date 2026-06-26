// Prisma
import { prisma } from '#lib/prisma'
import type { IAnswer } from './reviews.types'

// Queue
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
      message: 'Запрос на создание ответов на отзывы принят!',
    } as const
  } catch (error) {
    return {
      success: false,
      status: 500,
      message: 'Ошибка при создании задачи создание ответов на отзывы',
      error,
    } as const
  }
}

export const getReviews = async (pointId: number) => {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        companyPointId: pointId,
      },
    })

    return {
      success: true,
      status: 200,
      message: 'Все отзывы успешно получены',
      data: reviews,
    } as const
  } catch (error) {
    return {
      success: false,
      status: 500,
      message: 'Ошибка при получении всех отзывов',
      error,
    } as const
  }
}

export const changeReview = async (reviewId: number, pointId: number, body: IAnswer) => {
  try {
    await prisma.review.update({
      where: { id: reviewId, companyPointId: pointId },
      data: { aiAnswer: body.aiAnswer },
    })

    return {
      success: true,
      status: 200,
      message: 'Ответ отзыва успешно изменен',
    } as const
  } catch (error) {
    return {
      success: false,
      status: 500,
      message: 'Ошибка при изменений ответа отзыва',
      error,
    } as const
  }
}
