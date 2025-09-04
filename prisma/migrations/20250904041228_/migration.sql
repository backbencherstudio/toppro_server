/*
  Warnings:

  - You are about to drop the `_PurchaseToPurchaseItems` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_PurchaseToPurchaseItems" DROP CONSTRAINT "_PurchaseToPurchaseItems_A_fkey";

-- DropForeignKey
ALTER TABLE "_PurchaseToPurchaseItems" DROP CONSTRAINT "_PurchaseToPurchaseItems_B_fkey";

-- DropTable
DROP TABLE "_PurchaseToPurchaseItems";

-- AddForeignKey
ALTER TABLE "Purchase_items" ADD CONSTRAINT "Purchase_items_purchase_id_fkey" FOREIGN KEY ("purchase_id") REFERENCES "purchases"("id") ON DELETE SET NULL ON UPDATE CASCADE;
