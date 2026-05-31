import { Redis } from 'ioredis'

const REDIS_HOST = process.env.REDIS_HOST || 'localhost'
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379')

console.log(`[Redis] Trying to connect to ${REDIS_HOST}:${REDIS_PORT}...`)

export const redisConnection = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  maxRetriesPerRequest: null,
})

redisConnection.on('connect', () => {
  console.log('🔴 [Redis] Successfully connected to Docker container Redis!')
})

redisConnection.on('error', (error) => {
  console.error('❌ [Redis] Connection error:', error.message)
})
