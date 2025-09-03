-- DropForeignKey
ALTER TABLE "purchases" DROP CONSTRAINT "purchases_purchaseItemsId_fkey";

-- CreateTable
CREATE TABLE "_PurchaseToPurchaseItems" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PurchaseToPurchaseItems_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_PurchaseToPurchaseItems_B_index" ON "_PurchaseToPurchaseItems"("B");

-- AddForeignKey
ALTER TABLE "_PurchaseToPurchaseItems" ADD CONSTRAINT "_PurchaseToPurchaseItems_A_fkey" FOREIGN KEY ("A") REFERENCES "purchases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PurchaseToPurchaseItems" ADD CONSTRAINT "_PurchaseToPurchaseItems_B_fkey" FOREIGN KEY ("B") REFERENCES "Purchase_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
