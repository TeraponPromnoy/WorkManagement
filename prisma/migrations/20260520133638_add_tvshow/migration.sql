-- AlterTable
ALTER TABLE "WorkLog" ADD COLUMN     "tvShowId" INTEGER,
ALTER COLUMN "taskName" SET DEFAULT '';

-- CreateTable
CREATE TABLE "TvShow" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TvShow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TvShow_name_key" ON "TvShow"("name");

-- AddForeignKey
ALTER TABLE "WorkLog" ADD CONSTRAINT "WorkLog_tvShowId_fkey" FOREIGN KEY ("tvShowId") REFERENCES "TvShow"("id") ON DELETE SET NULL ON UPDATE CASCADE;
