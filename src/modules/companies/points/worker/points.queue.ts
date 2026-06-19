// BullMQ & Redis Config
import { Queue } from 'bullmq'
import { redisConfig } from '#lib/redis'

export const createPointQueue = new Queue('createPoint', { connection: redisConfig })
