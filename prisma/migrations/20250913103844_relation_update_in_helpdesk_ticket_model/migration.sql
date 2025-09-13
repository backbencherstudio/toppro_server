/*
  Warnings:

  - Added the required column `ticketId` to the `ticket_descriptions_with_attachments` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "help_desk_tickets" DROP CONSTRAINT "help_desk_tickets_descriptionId_fkey";

-- AlterTable
ALTER TABLE "ticket_descriptions_with_attachments" ADD COLUMN     "ticketId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "ticket_descriptions_with_attachments" ADD CONSTRAINT "ticket_descriptions_with_attachments_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "help_desk_tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
