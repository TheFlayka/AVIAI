import * as v from 'valibot'

export const answerSchema = v.partial(
  v.object({
    aiAnswer: v.pipe(
      v.string('Ответ на отзыв неправильного формата'),
      v.minLength(2, 'Ответ на отзыв должен содержать от 2 до 400 символов'),
      v.maxLength(400, 'Ответ на отзыв должен содержать от 2 до 400 символов'),
    ),
  }),
)
