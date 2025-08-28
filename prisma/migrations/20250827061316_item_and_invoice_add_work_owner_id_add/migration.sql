-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "owner_id" TEXT,
ADD COLUMN     "workspace_id" TEXT;

-- AlterTable
ALTER TABLE "items" ADD COLUMN     "owner_id" TEXT,
ADD COLUMN     "user_id" TEXT,
ADD COLUMN     "workspace_id" TEXT;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;
