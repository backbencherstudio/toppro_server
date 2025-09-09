-- AlterTable
ALTER TABLE "invoice_items" ADD COLUMN     "itemCategory_id" TEXT,
ADD COLUMN     "unit_id" TEXT;

-- AddForeignKey
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_itemCategory_id_fkey" FOREIGN KEY ("itemCategory_id") REFERENCES "ItemCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
