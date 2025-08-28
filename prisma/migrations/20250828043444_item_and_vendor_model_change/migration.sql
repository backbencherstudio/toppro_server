-- DropForeignKey
ALTER TABLE "items" DROP CONSTRAINT "items_vendor_id_fkey";

-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN     "itemType_id" TEXT,
ADD COLUMN     "item_id" TEXT;

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_itemType_id_fkey" FOREIGN KEY ("itemType_id") REFERENCES "ItemType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
