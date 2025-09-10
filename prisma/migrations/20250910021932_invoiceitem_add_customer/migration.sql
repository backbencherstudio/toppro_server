/*
  Warnings:

  - The primary key for the `_InvoiceToItems` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `invoice_items` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `invoices` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "_InvoiceToItems" DROP CONSTRAINT "_InvoiceToItems_A_fkey";

-- DropForeignKey
ALTER TABLE "invoice_items" DROP CONSTRAINT "invoice_items_invoice_id_fkey";

-- AlterTable
ALTER TABLE "_InvoiceToItems" DROP CONSTRAINT "_InvoiceToItems_AB_pkey",
ALTER COLUMN "A" SET DATA TYPE TEXT,
ADD CONSTRAINT "_InvoiceToItems_AB_pkey" PRIMARY KEY ("A", "B");

-- AlterTable
ALTER TABLE "invoice_items" DROP CONSTRAINT "invoice_items_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "invoice_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "invoice_items_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "invoice_items_id_seq";

-- AlterTable
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "invoices_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "invoices_id_seq";

-- AddForeignKey
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InvoiceToItems" ADD CONSTRAINT "_InvoiceToItems_A_fkey" FOREIGN KEY ("A") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
