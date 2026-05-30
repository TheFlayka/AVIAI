import { Hono } from 'hono'
import type { HonoBase } from 'hono/hono-base'

const app: HonoBase = new Hono()

const port = 3000
console.log(`🚀 HTTP-сервер Hono запущен на порту ${port}`)

export default {
  port,
  fetch: app.fetch,
}