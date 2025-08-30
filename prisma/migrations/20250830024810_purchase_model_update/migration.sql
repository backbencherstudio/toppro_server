/*
  Warnings:

  - You are about to drop the column `bill_id` on the `purchases` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "purchases" DROP CONSTRAINT "purchases_bill_id_fkey";

-- AlterTable
ALTER TABLE "bills" ADD COLUMN     "accountType_id" TEXT;

-- AlterTable
ALTER TABLE "items" ADD COLUMN     "accountTypeId" TEXT;

-- AlterTable
ALTER TABLE "purchases" DROP COLUMN "bill_id",
ADD COLUMN     "accountType_id" TEXT,
ADD COLUMN     "billId" TEXT,
ADD COLUMN     "billingCategory_id" TEXT,
ADD COLUMN     "discount" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "itemCategory_id" TEXT,
ADD COLUMN     "purchase_no" TEXT,
ADD COLUMN     "tax_id" TEXT,
ADD COLUMN     "vendor_id" TEXT;

-- CreateTable
CREATE TABLE "AccountType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccountType_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_accountTypeId_fkey" FOREIGN KEY ("accountTypeId") REFERENCES "AccountType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_tax_id_fkey" FOREIGN KEY ("tax_id") REFERENCES "Tax"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_billingCategory_id_fkey" FOREIGN KEY ("billingCategory_id") REFERENCES "BillCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_itemCategory_id_fkey" FOREIGN KEY ("itemCategory_id") REFERENCES "ItemCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_accountType_id_fkey" FOREIGN KEY ("accountType_id") REFERENCES "AccountType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_billId_fkey" FOREIGN KEY ("billId") REFERENCES "bills"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bills" ADD CONSTRAINT "bills_accountType_id_fkey" FOREIGN KEY ("accountType_id") REFERENCES "AccountType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
