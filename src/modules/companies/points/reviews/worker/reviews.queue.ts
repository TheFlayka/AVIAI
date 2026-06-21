// BullMQ & Redis Config
import { Queue } from 'bullmq'
import { redisConfig } from '#lib/redis'

export const parsingReviewsQueue = new Queue('parsingReviews', { connection: redisConfig })
export const answerReviewsQueue = new Queue('answerReviews', { connection: redisConfig })
