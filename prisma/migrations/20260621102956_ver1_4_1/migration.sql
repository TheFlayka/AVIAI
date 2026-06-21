/*
  Warnings:

  - The `status` column on the `Review` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ParsingReviewsStatus" AS ENUM ('IDLE', 'PROCESSING', 'SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('WAITING', 'SUCCESS', 'FAILED');

-- AlterTable
ALTER TABLE "CompanyPoint" ADD COLUMN     "lastParseAt" TIMESTAMP(3),
ADD COLUMN     "statusParsingReviews" "ParsingReviewsStatus" NOT NULL DEFAULT 'IDLE';

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "status",
ADD COLUMN     "status" "ReviewStatus" NOT NULL DEFAULT 'WAITING';
