// BullMQ & Redis Config
import { Worker, Job } from 'bullmq'
import { redisConfig } from '#lib/redis'

// Prisma
import { prisma } from '#lib/prisma'
import { parseReviews } from '#scripts/map_parser'
import type { IReview } from '../reviews.types'

export const parsingReviewWorker = new Worker(
  'parsingReviews',
  async (job: Job) => {
    console.log('[Review Worker] Started')

    // Get necessary data from job
    const { yandexId, pointId } = job.data

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
      await prisma.companyPoint.update({
        where: { id: pointId },
        data: { statusParsingReviews: 'PROCESSING' },
      })

      // call parseReview function
      const result = await parseReviews(yandexId, pointId, intJobId)
      if (result.success === false) {
        await prisma.company.update({
          where: { id: pointId },
          data: { statusParsingMaps: 'FAILED' },
        })
        throw new Error(result.message || 'Error of function review parser')
      }

      // get point object
      const point = await prisma.companyPoint.findFirst({
        where: { id: pointId },
      })

      if (!point) {
        await prisma.companyPoint.update({
          where: { id: pointId },
          data: { statusParsingReviews: 'FAILED' },
        })
        throw new Error('We do not find a point in Database')
      }

      // remove reviews which is earlier than lastParseAt
      let reviewsToSave = result.data

      if (point.lastParseAt !== null) {
        const lastParseTimestamp = point.lastParseAt.getTime()

        reviewsToSave = result.data.filter((review: IReview) => {
          const reviewTimestamp = new Date(review.createdAt).getTime()
          return reviewTimestamp > lastParseTimestamp
        })
      }

      await prisma.companyPoint.update({
        where: { id: pointId },
        data: { lastParseAt: new Date() },
      })

      await prisma.$transaction([
        prisma.review.createMany({
          data: result.data,
        }),
        prisma.companyPoint.update({
          where: { id: pointId },
          data: { statusParsingReviews: 'SUCCESS' },
        }),
      ])
    } catch (error) {
      console.error(
        `❌ [Review Parser Worker ${intJobId}] Error occurred while parsing points:`,
        error,
      )
      throw error
    }
  },
  {
    connection: redisConfig,
  },
)
