/*
  Warnings:

  - You are about to drop the column `item_id` on the `Purchase_items` table. All the data in the column will be lost.
  - You are about to drop the `_PurchaseItems` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Purchase_items" DROP CONSTRAINT "Purchase_items_itemCategory_id_fkey";

-- DropForeignKey
ALTER TABLE "Purchase_items" DROP CONSTRAINT "Purchase_items_itemType_id_fkey";

-- DropForeignKey
ALTER TABLE "Purchase_items" DROP CONSTRAINT "Purchase_items_item_id_fkey";

-- DropForeignKey
ALTER TABLE "Purchase_items" DROP CONSTRAINT "Purchase_items_purchase_id_fkey";

-- DropForeignKey
ALTER TABLE "Purchase_items" DROP CONSTRAINT "Purchase_items_tax_id_fkey";

-- DropForeignKey
ALTER TABLE "Purchase_items" DROP CONSTRAINT "Purchase_items_unit_id_fkey";

-- DropForeignKey
ALTER TABLE "Purchase_items" DROP CONSTRAINT "Purchase_items_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Purchase_items" DROP CONSTRAINT "Purchase_items_workspace_id_fkey";

-- DropForeignKey
ALTER TABLE "_PurchaseItems" DROP CONSTRAINT "_PurchaseItems_A_fkey";

-- DropForeignKey
ALTER TABLE "_PurchaseItems" DROP CONSTRAINT "_PurchaseItems_B_fkey";

-- DropForeignKey
ALTER TABLE "items" DROP CONSTRAINT "items_itemCategory_id_fkey";

-- DropForeignKey
ALTER TABLE "items" DROP CONSTRAINT "items_itemType_id_fkey";

-- DropForeignKey
ALTER TABLE "items" DROP CONSTRAINT "items_tax_id_fkey";

-- DropForeignKey
ALTER TABLE "items" DROP CONSTRAINT "items_unit_id_fkey";

-- DropForeignKey
ALTER TABLE "items" DROP CONSTRAINT "items_user_id_fkey";

-- DropForeignKey
ALTER TABLE "items" DROP CONSTRAINT "items_workspace_id_fkey";

-- DropForeignKey
ALTER TABLE "purchases" DROP CONSTRAINT "purchases_account_type_id_fkey";

-- DropForeignKey
ALTER TABLE "purchases" DROP CONSTRAINT "purchases_billing_type_id_fkey";

-- DropForeignKey
ALTER TABLE "purchases" DROP CONSTRAINT "purchases_category_id_fkey";

-- DropForeignKey
ALTER TABLE "purchases" DROP CONSTRAINT "purchases_user_id_fkey";

-- DropForeignKey
ALTER TABLE "purchases" DROP CONSTRAINT "purchases_vendor_id_fkey";

-- DropForeignKey
ALTER TABLE "purchases" DROP CONSTRAINT "purchases_workspace_id_fkey";

-- AlterTable
ALTER TABLE "Purchase_items" DROP COLUMN "item_id";

-- AlterTable
ALTER TABLE "purchases" ADD COLUMN     "itemsId" TEXT;

-- DropTable
DROP TABLE "_PurchaseItems";

-- CreateTable
CREATE TABLE "_ItemsToPurchaseItems" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ItemsToPurchaseItems_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_PurchaseToPurchaseItems" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PurchaseToPurchaseItems_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ItemsToPurchaseItems_B_index" ON "_ItemsToPurchaseItems"("B");

-- CreateIndex
CREATE INDEX "_PurchaseToPurchaseItems_B_index" ON "_PurchaseToPurchaseItems"("B");

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_tax_id_fkey" FOREIGN KEY ("tax_id") REFERENCES "Tax"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_itemCategory_id_fkey" FOREIGN KEY ("itemCategory_id") REFERENCES "ItemCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_itemType_id_fkey" FOREIGN KEY ("itemType_id") REFERENCES "ItemType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_account_type_id_fkey" FOREIGN KEY ("account_type_id") REFERENCES "AccountType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_billing_type_id_fkey" FOREIGN KEY ("billing_type_id") REFERENCES "BillCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "ItemCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_itemsId_fkey" FOREIGN KEY ("itemsId") REFERENCES "items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase_items" ADD CONSTRAINT "Purchase_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase_items" ADD CONSTRAINT "Purchase_items_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase_items" ADD CONSTRAINT "Purchase_items_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase_items" ADD CONSTRAINT "Purchase_items_tax_id_fkey" FOREIGN KEY ("tax_id") REFERENCES "Tax"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase_items" ADD CONSTRAINT "Purchase_items_itemCategory_id_fkey" FOREIGN KEY ("itemCategory_id") REFERENCES "ItemCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase_items" ADD CONSTRAINT "Purchase_items_itemType_id_fkey" FOREIGN KEY ("itemType_id") REFERENCES "ItemType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ItemsToPurchaseItems" ADD CONSTRAINT "_ItemsToPurchaseItems_A_fkey" FOREIGN KEY ("A") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ItemsToPurchaseItems" ADD CONSTRAINT "_ItemsToPurchaseItems_B_fkey" FOREIGN KEY ("B") REFERENCES "Purchase_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PurchaseToPurchaseItems" ADD CONSTRAINT "_PurchaseToPurchaseItems_A_fkey" FOREIGN KEY ("A") REFERENCES "purchases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PurchaseToPurchaseItems" ADD CONSTRAINT "_PurchaseToPurchaseItems_B_fkey" FOREIGN KEY ("B") REFERENCES "Purchase_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
