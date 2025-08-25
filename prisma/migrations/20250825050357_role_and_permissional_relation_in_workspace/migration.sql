-- AlterTable
ALTER TABLE "permissions" ADD COLUMN     "owner_id" TEXT,
ADD COLUMN     "user_id" TEXT,
ADD COLUMN     "workspace_id" TEXT;

-- AlterTable
ALTER TABLE "roles" ADD COLUMN     "owner_id" TEXT,
ADD COLUMN     "workspace_id" TEXT;

-- AddForeignKey
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
