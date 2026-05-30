-- CreateTable
CREATE TABLE "Review" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "aiAnswer" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);
