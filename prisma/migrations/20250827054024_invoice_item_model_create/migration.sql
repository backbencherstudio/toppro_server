-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "category_id" TEXT,
ADD COLUMN     "due" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "invoice_no" TEXT,
ADD COLUMN     "issued_amount" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "itemType_id" TEXT,
ADD COLUMN     "paid" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "subTotal" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "tax_id" TEXT,
ADD COLUMN     "total" DOUBLE PRECISION DEFAULT 0,
ALTER COLUMN "status" SET DEFAULT 'draft',
ALTER COLUMN "status" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "items" ADD COLUMN     "discount" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "itemType_id" TEXT,
ADD COLUMN     "total" DOUBLE PRECISION DEFAULT 0;

-- CreateTable
CREATE TABLE "ItemType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ItemType_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "InvoiceCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_tax_id_fkey" FOREIGN KEY ("tax_id") REFERENCES "Tax"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_itemType_id_fkey" FOREIGN KEY ("itemType_id") REFERENCES "ItemType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_itemType_id_fkey" FOREIGN KEY ("itemType_id") REFERENCES "ItemType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
