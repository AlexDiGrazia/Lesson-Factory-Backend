-- CreateTable
CREATE TABLE "VideoPurchase" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "videoId" INTEGER NOT NULL,

    CONSTRAINT "VideoPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VideoPurchase_userId_videoId_key" ON "VideoPurchase"("userId", "videoId");

-- AddForeignKey
ALTER TABLE "VideoPurchase" ADD CONSTRAINT "VideoPurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoPurchase" ADD CONSTRAINT "VideoPurchase_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;
