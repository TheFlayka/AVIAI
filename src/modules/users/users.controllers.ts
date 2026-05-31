// Hono
import { Context } from 'hono'

// Models
import { registerUser } from './user.model'

export async function registerUserController(c: Context) {
  try {
    const report = await registerUser(await c.req.json())
    return c.json(report, report.status)
  } catch (error) {
    console.error('❌ Error occurred while registering user:', error)
    return c.json(
      { status: 500, success: false, message: 'Ошибка при регистрации пользователя' },
      500,
    )
  }
}
