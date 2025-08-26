/*
  Warnings:

  - You are about to drop the column `password` on the `Vendor` table. All the data in the column will be lost.
  - Added the required column `owner_id` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workspace_id` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `owner_id` to the `Vendor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workspace_id` to the `Vendor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "owner_id" TEXT NOT NULL,
ADD COLUMN     "workspace_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Vendor" DROP COLUMN "password",
ADD COLUMN     "owner_id" TEXT NOT NULL,
ADD COLUMN     "workspace_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_id_fkey" FOREIGN KEY ("id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_id_fkey" FOREIGN KEY ("id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
