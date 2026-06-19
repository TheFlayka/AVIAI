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
