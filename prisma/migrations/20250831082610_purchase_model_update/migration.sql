-- DropForeignKey
ALTER TABLE "purchases" DROP CONSTRAINT "purchases_item_id_fkey";

-- CreateTable
CREATE TABLE "_ItemsToPurchase" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ItemsToPurchase_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ItemsToPurchase_B_index" ON "_ItemsToPurchase"("B");

-- AddForeignKey
ALTER TABLE "_ItemsToPurchase" ADD CONSTRAINT "_ItemsToPurchase_A_fkey" FOREIGN KEY ("A") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ItemsToPurchase" ADD CONSTRAINT "_ItemsToPurchase_B_fkey" FOREIGN KEY ("B") REFERENCES "purchases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
