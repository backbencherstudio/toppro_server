/*
  Warnings:

  - You are about to drop the `_AttachmentToTicketDescription` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ticket_descriptions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_AttachmentToTicketDescription" DROP CONSTRAINT "_AttachmentToTicketDescription_A_fkey";

-- DropForeignKey
ALTER TABLE "_AttachmentToTicketDescription" DROP CONSTRAINT "_AttachmentToTicketDescription_B_fkey";

-- DropForeignKey
ALTER TABLE "help_desk_tickets" DROP CONSTRAINT "help_desk_tickets_descriptionId_fkey";

-- DropForeignKey
ALTER TABLE "ticket_descriptions" DROP CONSTRAINT "ticket_descriptions_id_fkey";

-- DropTable
DROP TABLE "_AttachmentToTicketDescription";

-- DropTable
DROP TABLE "ticket_descriptions";

-- CreateTable
CREATE TABLE "ticket_descriptions_with_attachments" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "ticket_descriptions_with_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "description_attachments" (
    "id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "descriptionId" TEXT NOT NULL,

    CONSTRAINT "description_attachments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "help_desk_tickets" ADD CONSTRAINT "help_desk_tickets_descriptionId_fkey" FOREIGN KEY ("descriptionId") REFERENCES "ticket_descriptions_with_attachments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_descriptions_with_attachments" ADD CONSTRAINT "ticket_descriptions_with_attachments_id_fkey" FOREIGN KEY ("id") REFERENCES "help_desk_tickets"("descriptionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "description_attachments" ADD CONSTRAINT "description_attachments_descriptionId_fkey" FOREIGN KEY ("descriptionId") REFERENCES "ticket_descriptions_with_attachments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
