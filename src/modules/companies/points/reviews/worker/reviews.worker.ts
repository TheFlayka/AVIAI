// BullMQ & Redis Config
import { Worker, Job } from 'bullmq'
import { redisConfig } from '#lib/redis'

// Prisma
import { prisma } from '#lib/prisma'
import { parseReviews } from '#scripts/map_parser'
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

export const answerReviewWorker = new Worker(
  'answerReviews',
  async (job: Job) => {
    console.log('[Review Worker(Answer)] Started')

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
        where: { companyPointId: pointId, status: 'WAITING' },
      })

      for (const review of reviews) {
        const responseFromAi = await googleGenAI.models.generateContent({
          model: 'gemini-3.5-flash',
          contents:
            `Hello! Please, can you write answer for review, and be sure that: language is the same as used in review, you are good and don't say nothing bad for reviewer. Just write an answer without additional text. Thank you! Review: ` +
            review.text,
        })

        if (!responseFromAi.text) {
          await prisma.review.update({
            where: review,
            data: { aiAnswer: "CRITICAL!!!, AI DOESN'T ANSWER ON THE TEXT!!!" },
          })
        }

        await prisma.review.update({
          where: review,
          data: { aiAnswer: responseFromAi.text },
        })
        console.log('Review answer is done')

        await new Promise((resolve) => setTimeout(resolve, 10000))
      }

      console.log('[Review Worker] Answers have written!')
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
