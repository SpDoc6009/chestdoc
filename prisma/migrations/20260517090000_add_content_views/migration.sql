CREATE TABLE "ContentView" (
  "id" TEXT NOT NULL,
  "contentType" TEXT NOT NULL,
  "contentId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "path" TEXT NOT NULL,
  "viewCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ContentView_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ContentView_contentType_contentId_key" ON "ContentView"("contentType", "contentId");
CREATE INDEX "ContentView_contentType_idx" ON "ContentView"("contentType");
CREATE INDEX "ContentView_viewCount_idx" ON "ContentView"("viewCount");
