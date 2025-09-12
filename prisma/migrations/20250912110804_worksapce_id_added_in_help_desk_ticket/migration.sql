-- AlterTable
ALTER TABLE "help_desk_tickets" ADD COLUMN     "workspaceId" TEXT;

-- AddForeignKey
ALTER TABLE "help_desk_tickets" ADD CONSTRAINT "help_desk_tickets_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;
