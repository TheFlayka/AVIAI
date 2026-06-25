// BullMQ & Redis Config
import { Worker, Job } from 'bullmq'
import { redisConfig } from '#lib/redis'

// Prisma
import { prisma } from '#lib/prisma'

// Parser map Function
import { parseMap } from '#scripts/map_parser'

// Types
import type { IPoint } from '../points.types'

const syncPointsWorker = new Worker(
  'syncPoints',
  async (job: Job) => {
    // Get necessary data from job
    const { companyId, yandexMapsUrl } = job.data

    // Validate job.id
    const jobId = job.id
    if (!jobId) {
      throw new Error('There is not job id')
    }
    const intJobId = parseInt(jobId, 10)
    if (isNaN(intJobId)) {
      throw new Error('Job id is NaN!')
    }

    try {
      // Set status 'processing'
      await prisma.company.update({
        where: { id: companyId },
        data: { statusParsingMaps: 'PROCESSING' },
      })

      // call parseMap function
      const result = await parseMap(yandexMapsUrl, companyId, intJobId)
      if (result.success === false) {
        await prisma.company.update({
          where: { id: companyId },
          data: { statusParsingMaps: 'FAILED' },
        })
        throw new Error(result.message || 'Error of function map parser')
      }

      // Update data in database(we goes through all points and edit/create points in DB)
      const yandexIds: Array<string> = [] // It will help with deleting points in DB which disappear
      const updateData = result.data.map((point: IPoint) => {
        const stringYandexId = String(point.yandexId)
        yandexIds.push(stringYandexId)
        return prisma.companyPoint.upsert({
          where: { id: point.id, yandexId: stringYandexId },
          create: {
            ...point,
            yandexId: stringYandexId,
          },
          update: {
            ...point,
            yandexId: stringYandexId,
            deletedAt: null,
          },
        })
      })

      // Transaction prisma to sync new data with DB
      await prisma.$transaction([
        prisma.companyPoint.updateMany({
          where: {
            companyId: companyId,
            yandexId: {
              notIn: yandexIds,
            },
            deletedAt: null,
          },
          data: {
            deletedAt: new Date(),
          },
        }),
        ...updateData,
        prisma.company.update({
          where: { id: companyId },
          data: { statusParsingMaps: 'SUCCESS' },
        }),
      ])
      console.log(`[Sync points Worker ${intJobId}] Sync data is done`)
    } catch (error) {
      console.error(
        `❌ [Sync points Worker ${intJobId}] Error occurred while syncing points:`,
        error,
      )
      throw error
    }
  },
  { connection: redisConfig },
)
