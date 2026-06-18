// Prisma
import { prisma } from '#lib/prisma'

// Types
import type { ICompany, UpdateCompanyObject } from './companies.types'

export const createCompany = async (companyData: ICompany, id: number) => {
  try {
    // Check if we`ve already the same company
    const checkCompany = await prisma.company.findFirst({
      where: {
        name: companyData.name,
        ownerId: id,
      },
    })
    if (checkCompany) {
      return {
        success: false,
        status: 400,
        message: 'Заведение с таким названием уже существует',
      } as const
    }

    // Check URL field
    try {
      // Get url object from string
      const urlObj = new URL(companyData.yandexMapsUrl.trim())

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

    await prisma.company.create({
      data: {
        ...companyData,
        ownerId: id,
        createdAt: new Date(),
        deletedAt: null,
      },
    })

    return { success: true, status: 201, message: 'Заведение успешно создано' } as const
  } catch (error) {
    return { success: false, status: 500, message: 'Ошибка при создании заведения', error } as const
  }
}

export const getCompanies = async (id: number) => {
  try {
    const companies = await prisma.company.findMany({
      where: {
        ownerId: id,
      },
      omit: {
        deletedAt: true,
      },
    })

    return {
      success: true,
      status: 200,
      message: 'Все заведения успешно получены',
      data: companies,
    } as const
  } catch (error) {
    return {
      success: false,
      status: 500,
      message: 'Ошибка при получении всех заведений',
      error,
    } as const
  }
}

export const updateCompany = async (
  userId: number,
  companyId: number,
  body: UpdateCompanyObject,
) => {
  try {
    const company = await prisma.company.findFirst({
      where: {
        id: companyId,
        ownerId: userId,
      },
      omit: {
        deletedAt: true,
      },
    })

    if (!company) {
      return {
        success: false,
        status: 404,
        message: 'Не удалось найти заведение',
      } as const
    }

    return {
      success: true,
      status: 200,
      message: ' успешно получено',
      data: company,
    } as const
  } catch (error) {
    return {
      success: false,
      status: 500,
      message: 'Ошибка при получении заведения',
      error,
    } as const
  }
}
