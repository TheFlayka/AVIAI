import * as v from 'valibot'

export const loginSchema = v.object({
  username: v.pipe(
    v.string('Логин неправильного формата'),
    v.minLength(3, 'Минимальная длина логина 3'),
    v.maxLength(20, 'Максимальная длина логина 20'),
  ),
  password: v.pipe(
    v.string('Пароль неправильного формата'),
    v.minLength(6, 'Минимальная длина пароля 6'),
    v.maxLength(20, 'Максимальная длина пароля 20'),
  ),
})

export const registrationSchema = v.object({
  ...loginSchema.entries,
  name: v.pipe(v.string('Имя неправильного формата'), v.nonEmpty('Имя не может быть пустым')),
  surname: v.optional(v.string('Фамилия неправильного формата')),
})

export const optionalRegistrationSchema = v.optional(registrationSchema)

export const passwordSchema = v.object({
  oldPassword: v.pipe(
    v.string('Старый пароль неправильного формата'),
    v.minLength(6, 'Минимальная длина старого пароля 6'),
    v.maxLength(20, 'Максимальная длина старого пароля 20'),
  ),
  newPassword: v.pipe(
    v.string('Новый пароль неправильного формата'),
    v.minLength(6, 'Минимальная длина нового пароля 6'),
    v.maxLength(20, 'Максимальная длина нового пароля 20'),
  ),
})
