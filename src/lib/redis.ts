import { Redis } from 'ioredis'

const REDIS_HOST = process.env.REDIS_HOST || 'localhost'
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379')

console.log(`[Redis] Попытка подключения к ${REDIS_HOST}:${REDIS_PORT}...`)

export const redisConnection = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  maxRetriesPerRequest: null,
})

redisConnection.on('connect', () => {
  console.log('🔴 [Redis] Успешно подключено к Docker-контейнеру Redis!')
})

redisConnection.on('error', (error) => {
  console.error('❌ [Redis] Ошибка подключения:', error.message)
})
