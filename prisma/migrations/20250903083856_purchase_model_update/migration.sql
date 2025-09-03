/*
  Warnings:

  - You are about to drop the column `accountType_id` on the `purchases` table. All the data in the column will be lost.
  - You are about to drop the column `billId` on the `purchases` table. All the data in the column will be lost.
  - You are about to drop the column `billingCategory_id` on the `purchases` table. All the data in the column will be lost.
  - You are about to drop the column `discount` on the `purchases` table. All the data in the column will be lost.
  - You are about to drop the column `itemCategory_id` on the `purchases` table. All the data in the column will be lost.
  - You are about to drop the column `item_id` on the `purchases` table. All the data in the column will be lost.
  - You are about to drop the column `purchaseItemsId` on the `purchases` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `purchases` table. All the data in the column will be lost.
  - You are about to drop the column `tax_id` on the `purchases` table. All the data in the column will be lost.
  - You are about to drop the column `total_price` on the `purchases` table. All the data in the column will be lost.
  - You are about to drop the column `unit_price` on the `purchases` table. All the data in the column will be lost.
  - You are about to drop the `_ItemsToPurchase` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[purchase_no]` on the table `purchases` will be added. If there are existing duplicate values, this will fail.
  - Made the column `purchase_no` on table `purchases` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'READ', 'DRAFT');

-- DropForeignKey
ALTER TABLE "_ItemsToPurchase" DROP CONSTRAINT "_ItemsToPurchase_A_fkey";

-- DropForeignKey
ALTER TABLE "_ItemsToPurchase" DROP CONSTRAINT "_ItemsToPurchase_B_fkey";

-- DropForeignKey
ALTER TABLE "purchases" DROP CONSTRAINT "purchases_accountType_id_fkey";

-- DropForeignKey
ALTER TABLE "purchases" DROP CONSTRAINT "purchases_billId_fkey";

-- DropForeignKey
ALTER TABLE "purchases" DROP CONSTRAINT "purchases_billingCategory_id_fkey";

-- DropForeignKey
ALTER TABLE "purchases" DROP CONSTRAINT "purchases_itemCategory_id_fkey";

-- DropForeignKey
ALTER TABLE "purchases" DROP CONSTRAINT "purchases_tax_id_fkey";

-- AlterTable
ALTER TABLE "purchases" DROP COLUMN "accountType_id",
DROP COLUMN "billId",
DROP COLUMN "billingCategory_id",
DROP COLUMN "discount",
DROP COLUMN "itemCategory_id",
DROP COLUMN "item_id",
DROP COLUMN "purchaseItemsId",
DROP COLUMN "quantity",
DROP COLUMN "tax_id",
DROP COLUMN "total_price",
DROP COLUMN "unit_price",
ADD COLUMN     "account_type_id" TEXT,
ADD COLUMN     "billing_type_id" TEXT,
ADD COLUMN     "category_id" TEXT,
ADD COLUMN     "itemsId" TEXT,
ADD COLUMN     "purchase_date" TIMESTAMP(3),
ADD COLUMN     "status" "Status" DEFAULT 'DRAFT',
ALTER COLUMN "purchase_no" SET NOT NULL;

-- DropTable
DROP TABLE "_ItemsToPurchase";

-- CreateTable
CREATE TABLE "_PurchaseToTax" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PurchaseToTax_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_BillToPurchase" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BillToPurchase_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_PurchaseToTax_B_index" ON "_PurchaseToTax"("B");

-- CreateIndex
CREATE INDEX "_BillToPurchase_B_index" ON "_BillToPurchase"("B");

-- CreateIndex
CREATE UNIQUE INDEX "purchases_purchase_no_key" ON "purchases"("purchase_no");

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_account_type_id_fkey" FOREIGN KEY ("account_type_id") REFERENCES "AccountType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_billing_type_id_fkey" FOREIGN KEY ("billing_type_id") REFERENCES "BillCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "ItemCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_itemsId_fkey" FOREIGN KEY ("itemsId") REFERENCES "items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PurchaseToTax" ADD CONSTRAINT "_PurchaseToTax_A_fkey" FOREIGN KEY ("A") REFERENCES "purchases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PurchaseToTax" ADD CONSTRAINT "_PurchaseToTax_B_fkey" FOREIGN KEY ("B") REFERENCES "Tax"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BillToPurchase" ADD CONSTRAINT "_BillToPurchase_A_fkey" FOREIGN KEY ("A") REFERENCES "bills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BillToPurchase" ADD CONSTRAINT "_BillToPurchase_B_fkey" FOREIGN KEY ("B") REFERENCES "purchases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
