// BullMQ & Redis Config
import { Worker, Job } from 'bullmq'
import { redisConfig } from '#lib/redis'
// Prisma
import { prisma } from '#lib/prisma'

// Parser Function
import { parseMap } from '#scripts/map_parser'

const parseMapAndImportPointsWorker = new Worker(
  'createPoint',
  async (job: Job) => {
    const { companyId, yandexMapsUrl } = job.data
    try {
      console.log('Starting map parser worker')
      await prisma.company.update({
        where: { id: companyId },
        data: { statusParsingMaps: 'PROCESSING' },
      })

      const result = await parseMap(yandexMapsUrl, companyId)
      if (result.success === false) {
        await prisma.company.update({
          where: { id: companyId },
          data: { statusParsingMaps: 'FAILED' },
        })
        throw new Error(result.message || 'Ошибка парсинга карт')
      }

      await prisma.company.update({
        where: { id: companyId },
        data: { statusParsingMaps: 'SUCCESS' },
      })
    } catch (error) {
      console.error('❌ [Map Parser Worker] Error occurred while parsing points:', error)
      throw error
    }
  },
  { connection: redisConfig },
)
