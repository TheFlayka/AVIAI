// Prisma
import { prisma } from '#lib/prisma'

// Hono
import { sign } from 'hono/jwt'

// Types
import type { IRegisterUser, IUser } from './users.types'

export const registerUser = async (body: IRegisterUser) => {
  try {
    // Check if user with the same username already exists
    const user = await prisma.user.findUnique({
      where: { username: body.username },
    })
    if (user)
      return {
        status: 409,
        success: false,
        message: 'Пользователь с таким логином существует, введите другой',
      } as const

    // Hash the password
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

export const loginUser = async (body: IUser) => {
  try {
    // Check if JWT_SECRET is defined in environment variables
    const secret = process.env.JWT_SECRET
    if (!secret) throw new Error('❌ [CRITICAL]: JWT_SECRET not found in environment variables')

    // Find user by username
    const user = await prisma.user.findUnique({
      where: { username: body.username },
    })
    if (!user) return { status: 404, success: false, message: 'Пользователь не найден' } as const

    // Verify password
    const validPassword: boolean = await Bun.password.verify(body.password, user.password)
    if (!validPassword) return { status: 401, success: false, message: 'Неверный пароль' } as const

    // Create access and refresh tokens
    const accessToken = {
      sub: user.id,
      role: 'user',
      exp: Math.floor(Date.now() / 1000) + 60 * 15,
    }
    const refreshToken = {
      sub: user.id,
      role: 'user',
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: await sign(refreshToken, secret) },
    })

    return {
      status: 200,
      success: true,
      message: 'Пользователь успешно авторизован',
      data: { access: await sign(accessToken, secret), refresh: await sign(refreshToken, secret) },
    } as const
  } catch (error) {
    return {
      status: 500,
      success: false,
      message: 'Ошибка при авторизаций пользователя',
      data: error,
    } as const
  }
}
