// BullMQ & Redis Config
import { Worker, Job } from 'bullmq'
import { redisConfig } from '#lib/redis'

// Prisma
import { prisma } from '#lib/prisma'

// Parse function
import { parseReviews } from '#scripts/map_parser'

// Types
import type { IReview } from '../reviews.types'

// Google GenAI
import { GoogleGenAI } from '@google/genai'
import type { GenerateContentResponse } from '@google/genai'

const googleGenAI = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY!,
})

export const parsingReviewWorker = new Worker(
  'parsingReviews',
  async (job: Job) => {
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
        throw new Error('We do not find the point in Database')
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
        `❌ [Review Worker ${intJobId}] Error occurred while parsing reviews page:`,
        error,
      )
      throw error
    }
  },
  {
    connection: redisConfig,
  },
)

export const answerReviewWorker = new Worker(
  'answerReviews',
  async (job: Job) => {
    // Get necessary data from job
    const { pointId } = job.data

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
      const reviews = await prisma.review.findMany({
        where: { companyPointId: pointId, status: { in: ['WAITING', 'FAILED'] } },
      })

      for (const review of reviews) {
        const responseFromAi = await googleGenAI.models.generateContent({
          model: 'gemini-3.5-flash',
          contents:
            `Hello! Please, can you write answer for review, and be sure that: language is the same as used in review, you are good and don't say nothing bad for reviewer. Just write an answer without additional text. Thank you! Review: ` +
            review.content,
        })

        if (!responseFromAi.text) {
          console.log(`⚠️ [Answer Worker ${intJobId}] AI doesn't answer review`)
          await prisma.review.update({
            where: review,
            data: {
              aiAnswer: "CRITICAL!!!, AI DOESN'T ANSWER ON THE TEXT!!!",
              statusWritingAnswer: 'FAILED',
            },
          })
          await new Promise((resolve) => setTimeout(resolve, 10000))
          continue
        }

        await prisma.review.update({
          where: review,
          data: { aiAnswer: responseFromAi.text, statusWritingAnswer: 'SUCCESS' },
        })
        await new Promise((resolve) => setTimeout(resolve, 10000))
      }

      console.log('[Answer Worker] Answers have written!')
    } catch (error) {
      console.error(`❌ [Answer Worker ${intJobId}] Error occurred while answering reviews:`, error)
      throw error
    }
  },
  {
    connection: redisConfig,
  },
)
