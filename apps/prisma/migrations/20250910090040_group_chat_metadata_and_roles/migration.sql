-- CreateEnum
CREATE TYPE "public"."ConversationRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- AlterTable
ALTER TABLE "public"."Conversation" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "title" TEXT;

-- AlterTable
ALTER TABLE "public"."ConversationParticipant" ADD COLUMN     "role" "public"."ConversationRole" NOT NULL DEFAULT 'MEMBER';

-- AddForeignKey
ALTER TABLE "public"."Conversation" ADD CONSTRAINT "Conversation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
