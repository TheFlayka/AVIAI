// Prisma
import { prisma } from '#lib/prisma'

// Hono
import { sign } from 'hono/jwt'

// Types
import type { IChangePassword, IRegisterUser, IUser, UpdateUserObject } from './users.types'

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
      where: { username: body.username, deletedAt: null },
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

export const changeUser = async (id: number, body: UpdateUserObject, user: IUser) => {
  try {
    // Check Username change
    if (body.username) {
      // If user wants to change username, they must provide current password for verification
      if (!body.password)
        return {
          status: 400,
          success: false,
          message: 'Для изменения логина необходимо указать текущий пароль',
        } as const
      const validPassword: boolean = await Bun.password.verify(body.password, user.password)
      if (!validPassword)
        return { status: 400, success: false, message: 'Неправильный пароль' } as const

      // Check if new username is the same as the old one
      if (body.username === user.username)
        return { status: 400, success: false, message: 'Новый логин совпадает со старым' } as const

      // Check if new username already exists
      const loginExists = await prisma.user.findUnique({
        where: { username: body.username },
      })
      if (loginExists)
        return {
          status: 409,
          success: false,
          message: 'Пользователь с таким логином  уже существует',
        } as const
    }

    const { password, ...updateBody } = body

    await prisma.user.update({
      where: { id, deletedAt: null },
      data: {
        ...updateBody,
      },
    })

    return { status: 200, success: true, message: 'Данные пользователя изменены' } as const
  } catch (error) {
    return {
      status: 500,
      success: false,
      message: 'Ошибка при получений данных пользователя',
      data: error,
    } as const
  }
}

export const changePasswordUser = async (id: number, body: IChangePassword, user: IUser) => {
  try {
    // Check if new password is the same as the old one
    if (body.oldPassword === body.newPassword)
      return { status: 400, success: false, message: 'Новый пароль совпадает со старым' } as const

    // Verify old password
    const validPassword: boolean = await Bun.password.verify(body.oldPassword, user.password)
    if (!validPassword)
      return { status: 400, success: false, message: 'Неправильный старый пароль' } as const

    // Hash the new password
    const passwordHash: string = await Bun.password.hash(body.newPassword)

    await prisma.user.update({
      where: { id, deletedAt: null },
      data: {
        password: passwordHash,
        passwordChangedAt: new Date(),
      },
    })
    return { status: 200, success: true, message: 'Пароль пользователя изменен' } as const
  } catch (error) {
    return {
      status: 500,
      success: false,
      message: 'Ошибка при изменении пароля пользователя',
      data: error,
    } as const
  }
}

export const deleteUser = async (id: number) => {
  try {
    await prisma.user.update({
      where: { id, deletedAt: null },
      data: { deletedAt: new Date(), refreshToken: null },
    })

    return { status: 200, success: true, message: 'Пользователь удален' } as const
  } catch (error) {
    return {
      status: 500,
      success: false,
      message: 'Ошибка при удалении пользователя',
      data: error,
    } as const
  }
}
