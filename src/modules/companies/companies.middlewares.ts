// Hono
import { Context, type Next } from 'hono'

// Prisma
import { prisma } from '#lib/prisma'

export async function findCompanyMiddleware(c: Context, next: Next) {
  try {
    // ID(get, check, int)
    const id = c.req.param('id')
    if (!id) {
      return c.json(
        {
          status: 400,
          success: false,
          message: 'Не указан ID заведения',
        },
        400,
      )
    }
    // Make it to Int
    const companyIdNum = parseInt(id, 10)
    if (isNaN(companyIdNum)) {
      return c.json(
        { success: false, status: 400, message: 'ID заведения должно быть числом' },
        400,
      )
    }

    // Exclude endpoint
    const path = c.req.path
    if (path.includes('recovery')) {
      c.set('companyId', companyIdNum)
      return await next()
    }

    // Find company in DB
    const company = await prisma.company.findFirst({
      where: {
        id: companyIdNum,
        ownerId: c.get('userId'),
        deletedAt: null,
      },
      omit: {
        deletedAt: true,
      },
    })
    if (!company) {
      return c.json(
        {
          success: false,
          status: 404,
          message: 'Не удалось найти заведение',
        },
        404,
      )
    }

    ;(c.set('companyId', companyIdNum), c.set('company', company))

    await next()
  } catch (error) {
    console.error('❌ [Find company middleware]:', error)
    return c.json(
      {
        success: false,
        status: 500,
        message: 'Произошла внутренняя ошибка при проверке заведения',
      },
      500,
    )
  }
}
