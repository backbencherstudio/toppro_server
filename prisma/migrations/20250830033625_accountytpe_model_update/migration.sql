/*
  Warnings:

  - Added the required column `owner_id` to the `AccountType` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `AccountType` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workspace_id` to the `AccountType` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AccountType" ADD COLUMN     "owner_id" TEXT NOT NULL,
ADD COLUMN     "status" SMALLINT DEFAULT 1,
ADD COLUMN     "user_id" TEXT NOT NULL,
ADD COLUMN     "workspace_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "BillCategory" ADD COLUMN     "status" SMALLINT DEFAULT 1;

-- AlterTable
ALTER TABLE "InvoiceCategory" ADD COLUMN     "status" SMALLINT DEFAULT 1;

-- AlterTable
ALTER TABLE "ItemCategory" ADD COLUMN     "status" SMALLINT DEFAULT 1;

-- AlterTable
ALTER TABLE "ItemType" ADD COLUMN     "status" SMALLINT DEFAULT 1;

-- AlterTable
ALTER TABLE "Tax" ADD COLUMN     "status" SMALLINT DEFAULT 1;

-- AlterTable
ALTER TABLE "Unit" ADD COLUMN     "status" SMALLINT DEFAULT 1;

-- AddForeignKey
ALTER TABLE "AccountType" ADD CONSTRAINT "AccountType_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountType" ADD CONSTRAINT "AccountType_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
