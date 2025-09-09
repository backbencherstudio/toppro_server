/*
  Warnings:

  - The primary key for the `_InvoiceToItems` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `invoices` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `amount` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `category_id` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `due` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `due_at` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `invoice_no` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `issued_at` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `itemType_id` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `paid` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `purchaseItemsId` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `tax_id` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `total` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `invoices` table. All the data in the column will be lost.
  - The `id` column on the `invoices` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `A` on the `_InvoiceToItems` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `dueAt` to the `invoices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `invoice_number` to the `invoices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `issueAt` to the `invoices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalDiscount` to the `invoices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalPrice` to the `invoices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalTax` to the `invoices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `invoices` table without a default value. This is not possible if the table is not empty.
  - Made the column `status` on table `invoices` required. This step will fail if there are existing NULL values in that column.
  - Made the column `subTotal` on table `invoices` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "_InvoiceToItems" DROP CONSTRAINT "_InvoiceToItems_A_fkey";

-- DropForeignKey
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_category_id_fkey";

-- DropForeignKey
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_itemType_id_fkey";

-- DropForeignKey
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_purchaseItemsId_fkey";

-- DropForeignKey
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_tax_id_fkey";

-- AlterTable
ALTER TABLE "_InvoiceToItems" DROP CONSTRAINT "_InvoiceToItems_AB_pkey",
DROP COLUMN "A",
ADD COLUMN     "A" INTEGER NOT NULL,
ADD CONSTRAINT "_InvoiceToItems_AB_pkey" PRIMARY KEY ("A", "B");

-- AlterTable
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_pkey",
DROP COLUMN "amount",
DROP COLUMN "category_id",
DROP COLUMN "created_at",
DROP COLUMN "currency",
DROP COLUMN "deleted_at",
DROP COLUMN "due",
DROP COLUMN "due_at",
DROP COLUMN "invoice_no",
DROP COLUMN "issued_at",
DROP COLUMN "itemType_id",
DROP COLUMN "paid",
DROP COLUMN "purchaseItemsId",
DROP COLUMN "tax_id",
DROP COLUMN "total",
DROP COLUMN "updated_at",
ADD COLUMN     "account_type_id" TEXT,
ADD COLUMN     "billing_type_id" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dueAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "invoice_category_id" TEXT,
ADD COLUMN     "invoice_number" TEXT NOT NULL,
ADD COLUMN     "issueAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "item_category_id" TEXT,
ADD COLUMN     "totalDiscount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "totalPrice" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "totalTax" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "status" SET NOT NULL,
ALTER COLUMN "status" DROP DEFAULT,
ALTER COLUMN "subTotal" SET NOT NULL,
ALTER COLUMN "subTotal" DROP DEFAULT,
ADD CONSTRAINT "invoices_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "invoice_items" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "sku" TEXT,
    "image" TEXT,
    "invoice_id" INTEGER,
    "item_type_id" TEXT,
    "item_id" TEXT,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL,
    "tax_id" TEXT,
    "total" DOUBLE PRECISION,
    "description" TEXT,
    "customer_id" TEXT,
    "purchase_price" DOUBLE PRECISION,
    "sale_price" DOUBLE PRECISION,
    "owner_id" TEXT,
    "workspace_id" TEXT,
    "user_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoice_items_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_account_type_id_fkey" FOREIGN KEY ("account_type_id") REFERENCES "AccountType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_billing_type_id_fkey" FOREIGN KEY ("billing_type_id") REFERENCES "BillCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_item_category_id_fkey" FOREIGN KEY ("item_category_id") REFERENCES "ItemCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_invoice_category_id_fkey" FOREIGN KEY ("invoice_category_id") REFERENCES "InvoiceCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_item_type_id_fkey" FOREIGN KEY ("item_type_id") REFERENCES "ItemType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_tax_id_fkey" FOREIGN KEY ("tax_id") REFERENCES "Tax"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InvoiceToItems" ADD CONSTRAINT "_InvoiceToItems_A_fkey" FOREIGN KEY ("A") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
