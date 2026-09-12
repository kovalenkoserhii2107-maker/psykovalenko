-- CreateEnum
CREATE TYPE "ClientStatus" AS ENUM ('ACTIVE', 'PAUSED', 'FINISHED');

-- CreateEnum
CREATE TYPE "NoteKind" AS ENUM ('NOTE', 'SESSION', 'INSIGHT');

-- AlterTable
ALTER TABLE "ClientProfile" ADD COLUMN     "context" TEXT,
ADD COLUMN     "format" TEXT,
ADD COLUMN     "goals" TEXT,
ADD COLUMN     "referral" TEXT,
ADD COLUMN     "risks" TEXT,
ADD COLUMN     "status" "ClientStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "ClientNote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" "NoteKind" NOT NULL DEFAULT 'NOTE',
    "body" TEXT NOT NULL,
    "sessionId" TEXT,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientTask" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "doneAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientTask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClientNote_userId_createdAt_idx" ON "ClientNote"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ClientNote_sessionId_idx" ON "ClientNote"("sessionId");

-- CreateIndex
CREATE INDEX "ClientTask_userId_done_idx" ON "ClientTask"("userId", "done");

-- AddForeignKey
ALTER TABLE "ClientNote" ADD CONSTRAINT "ClientNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientNote" ADD CONSTRAINT "ClientNote_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientTask" ADD CONSTRAINT "ClientTask_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

