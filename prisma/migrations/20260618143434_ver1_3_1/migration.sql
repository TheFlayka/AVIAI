-- CreateEnum
CREATE TYPE "ParsingStatus" AS ENUM ('IDLE', 'PROCESSING', 'SUCCESS', 'FAILED');

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "statusParsingMaps" "ParsingStatus" NOT NULL DEFAULT 'IDLE';
