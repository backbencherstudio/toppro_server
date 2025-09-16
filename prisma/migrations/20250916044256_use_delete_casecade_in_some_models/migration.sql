-- DropForeignKey
ALTER TABLE "description_attachments" DROP CONSTRAINT "description_attachments_descriptionId_fkey";

-- DropForeignKey
ALTER TABLE "help_desk_tickets" DROP CONSTRAINT "help_desk_tickets_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "help_desk_tickets" DROP CONSTRAINT "help_desk_tickets_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "help_desk_tickets" DROP CONSTRAINT "help_desk_tickets_customerId_fkey";

-- DropForeignKey
ALTER TABLE "help_desk_tickets" DROP CONSTRAINT "help_desk_tickets_workspaceId_fkey";

-- DropForeignKey
ALTER TABLE "ticket_descriptions_with_attachments" DROP CONSTRAINT "ticket_descriptions_with_attachments_ticketId_fkey";

-- AddForeignKey
ALTER TABLE "help_desk_tickets" ADD CONSTRAINT "help_desk_tickets_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "help_desk_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "help_desk_tickets" ADD CONSTRAINT "help_desk_tickets_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "help_desk_tickets" ADD CONSTRAINT "help_desk_tickets_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "help_desk_tickets" ADD CONSTRAINT "help_desk_tickets_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_descriptions_with_attachments" ADD CONSTRAINT "ticket_descriptions_with_attachments_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "help_desk_tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "description_attachments" ADD CONSTRAINT "description_attachments_descriptionId_fkey" FOREIGN KEY ("descriptionId") REFERENCES "ticket_descriptions_with_attachments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
