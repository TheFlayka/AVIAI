// Configurations of Redis(Port, host and option for bullmq)
const REDIS_HOST = process.env.REDIS_HOST
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10)

export const redisConfig = {
  host: REDIS_HOST,
  port: REDIS_PORT,
  maxRetriesPerRequest: null,
}
