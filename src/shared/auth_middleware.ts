// Hono
import { Context, type Next } from 'hono'
import { verify, decode } from 'hono/jwt'
import { getCookie } from 'hono/cookie'

// Prisma
import { prisma } from '#lib/prisma'

// Types
import type { IUser } from '#modules/users/users.types'

export type AuthEnv = {
  Variables: {
    userId: number
    user: IUser
  }
}

export async function authMiddleware(c: Context<AuthEnv>, next: Next) {
  try {
    // Exclude recovery endpoint from authentication
    const path = c.req.path
    if (path.endsWith('/profile/recovery')) {
      return await next()
    }
    if (path.endsWith('/profile/login')) {
      return await next()
    }

    // Verify token from cookies
    const token = getCookie(c, 'access_token')
    if (!token) {
      console.warn('⚠️ [Auth Middleware]: Token not found in cookies')
      return c.json(
        {
          success: false,
          status: 401,
          message: 'Войдите в аккаунт (Сессия не найдена)',
        },
        401,
      )
    }

    // Check if JWT_SECRET is defined in environment variables
    const secret = process.env.JWT_SECRET
    if (!secret) {
      console.error('❌ [CRITICAL] JWT_SECRET not found in environment variables')
      return c.json({ success: false, message: 'Ошибка конфигурации сервера' }, 500)
    }

    // Verify JWT Token
    await verify(token, secret, 'HS256')

    // Decode token to get user ID
    const { payload } = decode(token)
    const userId = Number(payload.sub)

    if (!userId || Number.isNaN(userId)) {
      return c.json({ success: false, status: 401, message: 'Невалидная структура токена' }, 401)
    }

    // Find User
    const user = await prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
    })

    if (!user) {
      return c.json(
        { success: false, status: 401, message: 'Пользователь не найден или деактивирован' },
        401,
      )
    }

    c.set('userId', user.id)
    c.set('user', user)

    await next()
  } catch (error) {
    console.error('❌ [Auth Middleware]:', error)
    return c.json(
      {
        success: false,
        status: 401,
        message: 'Сессия истекла или токен поврежден, войдите заново',
      },
      401,
    )
  }
}
