-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "lastSeenAt" TIMESTAMPTZ(6);

-- CreateIndex
CREATE INDEX "User_lastSeenAt_idx" ON "public"."User"("lastSeenAt");
