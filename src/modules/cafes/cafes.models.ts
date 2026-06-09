// Prisma
import { prisma } from '#lib/prisma'

// Types
import type { ICafe } from './cafes.types'

export const createCafe = async (cafeData: ICafe, id: number) => {
  try {
    // Check if we`ve already the same cafe
    const checkCafe = await prisma.cafe.findFirst({
      where: {
        name: cafeData.name,
        ownerId: id,
      },
    })
    if (checkCafe) {
      return {
        success: false,
        status: 400,
        message: 'Кафе с таким названием уже существует',
      } as const
    }

    // Check URL field
    try {
      // Get url object from string
      const urlObj = new URL(cafeData.yandexMapsUrl.trim())
      console.log(urlObj.hostname)
      console.log(typeof urlObj.hostname)

      // Check Domain
      const allowedDomains = ['yandex.uz', 'yandex.ru', 'yandex.kz', 'yandex.com', 'yandex.by']

      let isStrictlyYandex = false
      for (const domain of allowedDomains) {
        if (urlObj.hostname === domain) {
          isStrictlyYandex = true
          break
        }
      }
      if (!isStrictlyYandex || !urlObj.pathname.startsWith('/maps')) throw new Error()
    } catch (error) {
      return {
        success: false,
        status: 400,
        message: 'Введен невалидный URL. Пожалуйста, укажите ссылку на yandex карты.',
      } as const
    }

    await prisma.cafe.create({
      data: {
        ...cafeData,
        ownerId: id,
        createdAt: new Date(),
        deletedAt: null,
      },
    })

    return { success: true, status: 201, message: 'Кафе успешно создано' } as const
  } catch (error) {
    return { success: false, status: 500, message: 'Ошибка при создании кафе', error } as const
  }
}
