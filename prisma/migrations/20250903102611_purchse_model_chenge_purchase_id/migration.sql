/*
  Warnings:

  - You are about to drop the column `accountTypeId` on the `items` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "items" DROP CONSTRAINT "items_accountTypeId_fkey";

-- AlterTable
ALTER TABLE "Purchase_items" ADD COLUMN     "purchase_id" TEXT;

-- AlterTable
ALTER TABLE "items" DROP COLUMN "accountTypeId",
ADD COLUMN     "account_type_id" TEXT;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_account_type_id_fkey" FOREIGN KEY ("account_type_id") REFERENCES "AccountType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
