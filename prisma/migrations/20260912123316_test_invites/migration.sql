-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('SENT', 'OPENED', 'COMPLETED');

-- AlterTable
ALTER TABLE "TestResult" ALTER COLUMN "userId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "TestInvite" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "testSlug" TEXT NOT NULL,
    "label" TEXT,
    "userId" TEXT,
    "respondentName" TEXT,
    "respondentEmail" TEXT,
    "status" "InviteStatus" NOT NULL DEFAULT 'SENT',
    "openedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "resultId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TestInvite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TestInvite_token_key" ON "TestInvite"("token");

-- CreateIndex
CREATE UNIQUE INDEX "TestInvite_resultId_key" ON "TestInvite"("resultId");

-- CreateIndex
CREATE INDEX "TestInvite_status_createdAt_idx" ON "TestInvite"("status", "createdAt");

-- CreateIndex
CREATE INDEX "TestInvite_userId_idx" ON "TestInvite"("userId");

-- CreateIndex
CREATE INDEX "TestInvite_testSlug_idx" ON "TestInvite"("testSlug");

-- AddForeignKey
ALTER TABLE "TestInvite" ADD CONSTRAINT "TestInvite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestInvite" ADD CONSTRAINT "TestInvite_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "TestResult"("id") ON DELETE SET NULL ON UPDATE CASCADE;

