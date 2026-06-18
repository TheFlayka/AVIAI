/*
  Warnings:

  - A unique constraint covering the columns `[yandexId]` on the table `CafePoint` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `yandexId` to the `CafePoint` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CafePoint" ADD COLUMN     "yandexId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "CafePoint_yandexId_key" ON "CafePoint"("yandexId");
