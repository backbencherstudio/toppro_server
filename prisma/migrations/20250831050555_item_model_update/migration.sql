-- DropForeignKey
ALTER TABLE "items" DROP CONSTRAINT "items_invoice_id_fkey";

-- CreateTable
CREATE TABLE "_InvoiceToItems" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_InvoiceToItems_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_InvoiceToItems_B_index" ON "_InvoiceToItems"("B");

-- AddForeignKey
ALTER TABLE "_InvoiceToItems" ADD CONSTRAINT "_InvoiceToItems_A_fkey" FOREIGN KEY ("A") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InvoiceToItems" ADD CONSTRAINT "_InvoiceToItems_B_fkey" FOREIGN KEY ("B") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
