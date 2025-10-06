-- CreateTable
CREATE TABLE "revenues" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "date" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION,
    "reference" TEXT,
    "description" TEXT,
    "files" TEXT,
    "account" TEXT,
    "customer" TEXT,
    "category" TEXT,
    "user_id" TEXT,
    "workspace_id" TEXT,
    "owner_id" TEXT,

    CONSTRAINT "revenues_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "revenues" ADD CONSTRAINT "revenues_account_fkey" FOREIGN KEY ("account") REFERENCES "bank_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revenues" ADD CONSTRAINT "revenues_customer_fkey" FOREIGN KEY ("customer") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revenues" ADD CONSTRAINT "revenues_category_fkey" FOREIGN KEY ("category") REFERENCES "InvoiceCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revenues" ADD CONSTRAINT "revenues_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revenues" ADD CONSTRAINT "revenues_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
