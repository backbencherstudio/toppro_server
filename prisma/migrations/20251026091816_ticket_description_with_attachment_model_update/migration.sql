/*
  Warnings:

  - Added the required column `creatorId` to the `ticket_descriptions_with_attachments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ticket_descriptions_with_attachments" ADD COLUMN     "creatorId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "ticket_descriptions_with_attachments" ADD CONSTRAINT "ticket_descriptions_with_attachments_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
