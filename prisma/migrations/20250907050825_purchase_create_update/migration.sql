/*
  Warnings:

  - You are about to drop the column `itemsId` on the `purchases` table. All the data in the column will be lost.
  - You are about to drop the `_ItemsToPurchaseItems` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `item_id` to the `Purchase_items` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Purchase_items" DROP CONSTRAINT "Purchase_items_itemCategory_id_fkey";

-- DropForeignKey
ALTER TABLE "Purchase_items" DROP CONSTRAINT "Purchase_items_itemType_id_fkey";

-- DropForeignKey
ALTER TABLE "Purchase_items" DROP CONSTRAINT "Purchase_items_tax_id_fkey";

-- DropForeignKey
ALTER TABLE "Purchase_items" DROP CONSTRAINT "Purchase_items_unit_id_fkey";

-- DropForeignKey
ALTER TABLE "Purchase_items" DROP CONSTRAINT "Purchase_items_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Purchase_items" DROP CONSTRAINT "Purchase_items_workspace_id_fkey";

-- DropForeignKey
ALTER TABLE "_ItemsToPurchaseItems" DROP CONSTRAINT "_ItemsToPurchaseItems_A_fkey";

-- DropForeignKey
ALTER TABLE "_ItemsToPurchaseItems" DROP CONSTRAINT "_ItemsToPurchaseItems_B_fkey";

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
ALTER TABLE "purchases" DROP CONSTRAINT "purchases_itemsId_fkey";

-- DropForeignKey
ALTER TABLE "purchases" DROP CONSTRAINT "purchases_user_id_fkey";

-- DropForeignKey
ALTER TABLE "purchases" DROP CONSTRAINT "purchases_vendor_id_fkey";

-- DropForeignKey
ALTER TABLE "purchases" DROP CONSTRAINT "purchases_workspace_id_fkey";

-- AlterTable
ALTER TABLE "Purchase_items" ADD COLUMN     "item_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "purchases" DROP COLUMN "itemsId";

-- DropTable
DROP TABLE "_ItemsToPurchaseItems";

-- CreateTable
CREATE TABLE "_PurchaseItems" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PurchaseItems_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_PurchaseItems_B_index" ON "_PurchaseItems"("B");

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_tax_id_fkey" FOREIGN KEY ("tax_id") REFERENCES "Tax"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_itemCategory_id_fkey" FOREIGN KEY ("itemCategory_id") REFERENCES "ItemCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_itemType_id_fkey" FOREIGN KEY ("itemType_id") REFERENCES "ItemType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_account_type_id_fkey" FOREIGN KEY ("account_type_id") REFERENCES "AccountType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_billing_type_id_fkey" FOREIGN KEY ("billing_type_id") REFERENCES "BillCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "ItemCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase_items" ADD CONSTRAINT "Purchase_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase_items" ADD CONSTRAINT "Purchase_items_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase_items" ADD CONSTRAINT "Purchase_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase_items" ADD CONSTRAINT "Purchase_items_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase_items" ADD CONSTRAINT "Purchase_items_tax_id_fkey" FOREIGN KEY ("tax_id") REFERENCES "Tax"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase_items" ADD CONSTRAINT "Purchase_items_itemCategory_id_fkey" FOREIGN KEY ("itemCategory_id") REFERENCES "ItemCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase_items" ADD CONSTRAINT "Purchase_items_itemType_id_fkey" FOREIGN KEY ("itemType_id") REFERENCES "ItemType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PurchaseItems" ADD CONSTRAINT "_PurchaseItems_A_fkey" FOREIGN KEY ("A") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PurchaseItems" ADD CONSTRAINT "_PurchaseItems_B_fkey" FOREIGN KEY ("B") REFERENCES "purchases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
