/*
  Warnings:

  - Added the required column `owner_id` to the `ItemType` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `ItemType` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workspace_id` to the `ItemType` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ItemType" ADD COLUMN     "owner_id" TEXT NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL,
ADD COLUMN     "workspace_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "ItemType" ADD CONSTRAINT "ItemType_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemType" ADD CONSTRAINT "ItemType_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
