// Prisma
import { prisma } from '#lib/prisma'

export const getPoints = async (id: number) => {
  try {
    const points = await prisma.companyPoint.findMany({
      where: {
        companyId: id,
      },
      omit: {
        deletedAt: true,
      },
    })

    return {
      success: true,
      status: 200,
      message: 'Все точки заведения успешно получены',
      data: points,
    } as const
  } catch (error) {
    return {
      success: false,
      status: 500,
      message: 'Ошибка при получении всех точек заведения',
      error,
    } as const
  }
}

export const getPoint = async (compId: number, pointId: number) => {
  try {
    const point = await prisma.companyPoint.findFirst({
      where: {
        companyId: compId,
        id: pointId,
      },
      omit: {
        deletedAt: true,
      },
    })

    if (!point) {
      return {
        success: false,
        status: 404,
        message: 'Не удалось найти точку заведения',
      } as const
    }

    return {
      success: true,
      status: 200,
      message: 'Точка заведения успешно получены',
      data: point,
    } as const
  } catch (error) {
    return {
      success: false,
      status: 500,
      message: 'Ошибка при получении точки заведения',
      error,
    } as const
  }
}
