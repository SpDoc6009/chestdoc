-- CreateEnum
CREATE TYPE "TeachingContentMode" AS ENUM ('MARKDOWN', 'HTML');

-- CreateTable
CREATE TABLE "TeachingTopic" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeachingTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeachingLesson" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "contentMode" "TeachingContentMode" NOT NULL DEFAULT 'MARKDOWN',
    "markdownContent" TEXT,
    "htmlContent" TEXT,
    "topicId" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeachingLesson_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TeachingTopic_slug_key" ON "TeachingTopic"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "TeachingLesson_slug_key" ON "TeachingLesson"("slug");

-- CreateIndex
CREATE INDEX "TeachingLesson_topicId_idx" ON "TeachingLesson"("topicId");

-- CreateIndex
CREATE INDEX "TeachingLesson_isPublished_updatedAt_idx" ON "TeachingLesson"("isPublished", "updatedAt");

-- AddForeignKey
ALTER TABLE "TeachingLesson" ADD CONSTRAINT "TeachingLesson_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "TeachingTopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
