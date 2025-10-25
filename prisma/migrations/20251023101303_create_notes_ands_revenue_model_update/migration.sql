/*
  Warnings:

  - You are about to drop the column `account` on the `revenues` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `revenues` table. All the data in the column will be lost.
  - You are about to drop the column `customer` on the `revenues` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "revenues" DROP CONSTRAINT "revenues_account_fkey";

-- DropForeignKey
ALTER TABLE "revenues" DROP CONSTRAINT "revenues_category_fkey";

-- DropForeignKey
ALTER TABLE "revenues" DROP CONSTRAINT "revenues_customer_fkey";

-- AlterTable
ALTER TABLE "credit_notes" ADD COLUMN     "customer_id" TEXT;

-- AlterTable
ALTER TABLE "revenues" DROP COLUMN "account",
DROP COLUMN "category",
DROP COLUMN "customer",
ADD COLUMN     "bank_account_id" TEXT,
ADD COLUMN     "customer_id" TEXT,
ADD COLUMN     "invoice_category_id" TEXT;

-- AddForeignKey
ALTER TABLE "revenues" ADD CONSTRAINT "revenues_bank_account_id_fkey" FOREIGN KEY ("bank_account_id") REFERENCES "bank_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revenues" ADD CONSTRAINT "revenues_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revenues" ADD CONSTRAINT "revenues_invoice_category_id_fkey" FOREIGN KEY ("invoice_category_id") REFERENCES "InvoiceCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_notes" ADD CONSTRAINT "credit_notes_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
