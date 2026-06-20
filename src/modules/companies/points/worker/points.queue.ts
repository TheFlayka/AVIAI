// BullMQ & Redis Config
import { Queue } from 'bullmq'
import { redisConfig } from '#lib/redis'

export const syncPointsQueue = new Queue('syncPoints', { connection: redisConfig })
