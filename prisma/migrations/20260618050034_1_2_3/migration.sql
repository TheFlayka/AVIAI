/*
  Warnings:

  - You are about to drop the column `cafePointId` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the `Cafe` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CafePoint` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `companyPointId` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Cafe" DROP CONSTRAINT "Cafe_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "CafePoint" DROP CONSTRAINT "CafePoint_cafeId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_cafePointId_fkey";

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "cafePointId",
ADD COLUMN     "companyPointId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Cafe";

-- DropTable
DROP TABLE "CafePoint";

-- CreateTable
CREATE TABLE "Company" (
    "id" SERIAL NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "yandexMapsUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyPoint" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "yandexId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "workHours" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "CompanyPoint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CompanyPoint_yandexId_key" ON "CompanyPoint"("yandexId");

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyPoint" ADD CONSTRAINT "CompanyPoint_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_companyPointId_fkey" FOREIGN KEY ("companyPointId") REFERENCES "CompanyPoint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
