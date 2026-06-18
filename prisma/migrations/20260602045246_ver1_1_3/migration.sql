/*
  Warnings:

  - You are about to drop the column `location` on the `Cafe` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Cafe` table. All the data in the column will be lost.
  - You are about to drop the column `cafeId` on the `Review` table. All the data in the column will be lost.
  - Added the required column `description` to the `Cafe` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerId` to the `Cafe` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cafePointId` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Cafe" DROP CONSTRAINT "Cafe_userId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_cafeId_fkey";

-- AlterTable
ALTER TABLE "Cafe" DROP COLUMN "location",
DROP COLUMN "userId",
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "ownerId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "cafeId",
ADD COLUMN     "cafePointId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "CafePoint" (
    "id" SERIAL NOT NULL,
    "cafeId" INTEGER NOT NULL,
    "address" TEXT NOT NULL,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "workHours" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "CafePoint_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Cafe" ADD CONSTRAINT "Cafe_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CafePoint" ADD CONSTRAINT "CafePoint_cafeId_fkey" FOREIGN KEY ("cafeId") REFERENCES "Cafe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_cafePointId_fkey" FOREIGN KEY ("cafePointId") REFERENCES "CafePoint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
