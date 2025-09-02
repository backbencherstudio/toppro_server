-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN     "purchaseItemsId" TEXT;

-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "purchaseItemsId" TEXT;

-- AlterTable
ALTER TABLE "leads" ADD COLUMN     "purchaseItemsId" TEXT;

-- AlterTable
ALTER TABLE "purchases" ADD COLUMN     "purchaseItemsId" TEXT;

-- CreateTable
CREATE TABLE "Purchase_items" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "name" TEXT,
    "sku" TEXT,
    "description" TEXT,
    "quantity" INTEGER DEFAULT 1,
    "image" TEXT,
    "discount" DOUBLE PRECISION DEFAULT 0,
    "total" DOUBLE PRECISION DEFAULT 0,
    "invoice_id" TEXT,
    "tax_id" TEXT,
    "itemCategory_id" TEXT,
    "sale_price" DOUBLE PRECISION DEFAULT 0,
    "purchase_price" DOUBLE PRECISION DEFAULT 0,
    "unit_id" TEXT,
    "vendor_id" TEXT,
    "itemType_id" TEXT,
    "owner_id" TEXT,
    "workspace_id" TEXT,
    "user_id" TEXT,
    "account_type_id" TEXT,
    "unit_price" DOUBLE PRECISION DEFAULT 0,
    "total_price" DOUBLE PRECISION DEFAULT 0,

    CONSTRAINT "Purchase_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ItemsToPurchaseItems" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ItemsToPurchaseItems_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ItemsToPurchaseItems_B_index" ON "_ItemsToPurchaseItems"("B");

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_purchaseItemsId_fkey" FOREIGN KEY ("purchaseItemsId") REFERENCES "Purchase_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_purchaseItemsId_fkey" FOREIGN KEY ("purchaseItemsId") REFERENCES "Purchase_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase_items" ADD CONSTRAINT "Purchase_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase_items" ADD CONSTRAINT "Purchase_items_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase_items" ADD CONSTRAINT "Purchase_items_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase_items" ADD CONSTRAINT "Purchase_items_tax_id_fkey" FOREIGN KEY ("tax_id") REFERENCES "Tax"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase_items" ADD CONSTRAINT "Purchase_items_itemCategory_id_fkey" FOREIGN KEY ("itemCategory_id") REFERENCES "ItemCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase_items" ADD CONSTRAINT "Purchase_items_itemType_id_fkey" FOREIGN KEY ("itemType_id") REFERENCES "ItemType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase_items" ADD CONSTRAINT "Purchase_items_account_type_id_fkey" FOREIGN KEY ("account_type_id") REFERENCES "AccountType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_purchaseItemsId_fkey" FOREIGN KEY ("purchaseItemsId") REFERENCES "Purchase_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_purchaseItemsId_fkey" FOREIGN KEY ("purchaseItemsId") REFERENCES "Purchase_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ItemsToPurchaseItems" ADD CONSTRAINT "_ItemsToPurchaseItems_A_fkey" FOREIGN KEY ("A") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ItemsToPurchaseItems" ADD CONSTRAINT "_ItemsToPurchaseItems_B_fkey" FOREIGN KEY ("B") REFERENCES "Purchase_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
