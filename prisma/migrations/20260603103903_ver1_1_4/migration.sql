/*
  Warnings:

  - Added the required column `name` to the `CafePoint` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CafePoint" ADD COLUMN     "name" TEXT NOT NULL;
