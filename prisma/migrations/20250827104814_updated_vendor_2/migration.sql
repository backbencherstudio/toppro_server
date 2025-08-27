-- DropForeignKey
ALTER TABLE "Vendor" DROP CONSTRAINT "Vendor_owner_id_fkey";

-- AlterTable
ALTER TABLE "Vendor" ALTER COLUMN "items_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
