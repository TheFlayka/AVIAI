// Prisma
import { prisma } from '#lib/prisma'

// Types
import type { IRegisterUser } from './users.types'

export const registerUser = async (body: IRegisterUser) => {
  try {
    const user = await prisma.user.findUnique({
      where: { username: body.username },
    })
    if (user)
      return {
        status: 409,
        success: false,
        message: 'Пользователь с таким логином существует, введите другой',
      } as const

    const passwordHash = await Bun.password.hash(body.password)

    const { password, ...bodyInfo } = body
    await prisma.user.create({
      data: {
        ...bodyInfo,
        password: passwordHash,
        createdAt: new Date(),
        passwordChangedAt: new Date(),
        deletedAt: null,
        refreshToken: null,
      },
    })

    return {
      status: 201,
      success: true,
      message: 'Пользователь успешно зарегистрирован',
    } as const
  } catch (error) {
    console.error('❌ Error registering user:', error)
    return {
      status: 500,
      success: false,
      message: 'Ошибка при регистрации пользователя',
      data: error,
    } as const
  }
}
