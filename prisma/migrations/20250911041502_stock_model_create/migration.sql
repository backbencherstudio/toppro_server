-- AlterTable
ALTER TABLE "Purchase_items" ADD COLUMN     "stock_id" TEXT;

-- AlterTable
ALTER TABLE "invoice_items" ADD COLUMN     "stock_id" TEXT,
ALTER COLUMN "quantity" SET DEFAULT 1,
ALTER COLUMN "price" SET DEFAULT 0,
ALTER COLUMN "discount" SET DEFAULT 0,
ALTER COLUMN "total" SET DEFAULT 0,
ALTER COLUMN "sale_price" DROP DEFAULT;

-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "due" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "paid" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "stock_id" TEXT,
ALTER COLUMN "status" SET DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "purchases" ADD COLUMN     "stock_id" TEXT;

-- CreateTable
CREATE TABLE "stock" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "product_name" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "image" TEXT,
    "item_id" TEXT,
    "owner_id" TEXT,
    "workspace_id" TEXT,
    "user_id" TEXT,

    CONSTRAINT "stock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "stock_item_id_key" ON "stock"("item_id");

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_stock_id_fkey" FOREIGN KEY ("stock_id") REFERENCES "stock"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_stock_id_fkey" FOREIGN KEY ("stock_id") REFERENCES "stock"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_stock_id_fkey" FOREIGN KEY ("stock_id") REFERENCES "stock"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase_items" ADD CONSTRAINT "Purchase_items_stock_id_fkey" FOREIGN KEY ("stock_id") REFERENCES "stock"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock" ADD CONSTRAINT "stock_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock" ADD CONSTRAINT "stock_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock" ADD CONSTRAINT "stock_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE SET NULL ON UPDATE CASCADE;
