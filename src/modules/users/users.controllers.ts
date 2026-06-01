// Hono
import { Context } from 'hono'
import { deleteCookie, setCookie } from 'hono/cookie'

// Models
import {
  changePasswordUser,
  changeUser,
  deleteUser,
  loginUser,
  logoutUser,
  recoveryUser,
  registerUser,
} from './users.model'

// Middlewares
import type { AuthEnv } from './users.middlewares'

export async function registerUserController(c: Context) {
  try {
    const report = await registerUser(await c.req.json())
    return c.json(report, report.status)
  } catch (error) {
    console.error('❌ [Users] Error occurred while registering user:', error)
    return c.json(
      { status: 500, success: false, message: 'Ошибка при регистрации пользователя' },
      500,
    )
  }
}

export async function loginUserController(c: Context<AuthEnv>) {
  try {
    const result = await loginUser(await c.req.json())
    if (result.success === false) {
      return c.json(result, result.status)
    }
    const expiryDate30Days = new Date()
    expiryDate30Days.setDate(expiryDate30Days.getDate() + 30)

    const expiryDate = new Date()
    expiryDate.setMinutes(expiryDate.getMinutes() + 15)

    setCookie(c, 'access_token', result.data.access, {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      maxAge: 15 * 60,
    })
    setCookie(c, 'refresh_token', result.data.refresh, {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      maxAge: 30 * 24 * 60 * 60,
    })

    const { data, ...resultDone } = result
    return c.json(resultDone, result.status)
  } catch (error) {
    console.error('❌ [Users] Error occurred while logging in user:', error)
    return c.json(
      { status: 500, success: false, message: 'Ошибка при авторизаций пользователя', data: error },
      500,
    )
  }
}

export async function getUserController(c: Context) {
  try {
    const { password, refreshToken, deletedAt, id, ...userInfo } = c.get('user')
    return c.json(
      { status: 200, success: true, message: 'Данные пользователя получены', data: userInfo },
      200,
    )
  } catch (error) {
    console.error('❌ [Users] Error occurred while getting user:', error)
    return c.json(
      { status: 500, success: false, message: 'Ошибка при получении данных пользователя' },
      500,
    )
  }
}

export async function changeUserController(c: Context) {
  try {
    const result = await changeUser(c.get('userId'), await c.req.json(), c.get('user'))
    return c.json(result, result.status)
  } catch (error) {
    console.error('❌ [Users] Error occurred while changing user:', error)
    return c.json(
      { status: 500, success: false, message: 'Ошибка при изменении данных пользователя' },
      500,
    )
  }
}

export async function changePasswordUserController(c: Context) {
  try {
    const result = await changePasswordUser(c.get('userId'), await c.req.json(), c.get('user'))
    return c.json(result, result.status)
  } catch (error) {
    console.error('❌ [Users] Error occurred while changing user password:', error)
    return c.json(
      { status: 500, success: false, message: 'Ошибка при изменении пароля пользователя' },
      500,
    )
  }
}

export async function deleteUserController(c: Context) {
  try {
    const result = await deleteUser(c.get('userId'))

    deleteCookie(c, 'access_token')
    deleteCookie(c, 'refresh_token')

    return c.json(result, result.status)
  } catch (error) {
    console.error('❌ [Users] Error occurred while deleting user:', error)
    return c.json({ status: 500, success: false, message: 'Ошибка при удалении пользователя' }, 500)
  }
}

export async function logoutUserController(c: Context) {
  try {
    const result = await logoutUser(c.get('userId'))

    deleteCookie(c, 'access_token')
    deleteCookie(c, 'refresh_token')

    return c.json(result, result.status)
  } catch (error) {
    console.error('❌ [Users] Error occurred while logging out user:', error)
    return c.json({ status: 500, success: false, message: 'Ошибка при выходе пользователя' }, 500)
  }
}

export async function recoveryUserController(c: Context) {
  try {
    const result = await recoveryUser(await c.req.json())
    return c.json(result, result.status)
  } catch (error) {
    console.error('❌ [Users] Error occurred while recovering user:', error)
    return c.json(
      { status: 500, success: false, message: 'Ошибка при восстановлении аккаунта пользователя' },
      500,
    )
  }
}
