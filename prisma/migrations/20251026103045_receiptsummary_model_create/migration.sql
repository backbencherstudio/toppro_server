-- CreateTable
CREATE TABLE "receipt_summaries" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3),
    "amount" DOUBLE PRECISION NOT NULL,
    "bank_account_id" TEXT,
    "invoice_id" TEXT,
    "reference" TEXT,
    "description" TEXT,
    "file" TEXT,
    "payment_type" TEXT NOT NULL DEFAULT 'manual',
    "ordered" TEXT,
    "owner_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "receipt_summaries_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "receipt_summaries" ADD CONSTRAINT "receipt_summaries_bank_account_id_fkey" FOREIGN KEY ("bank_account_id") REFERENCES "bank_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipt_summaries" ADD CONSTRAINT "receipt_summaries_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipt_summaries" ADD CONSTRAINT "receipt_summaries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipt_summaries" ADD CONSTRAINT "receipt_summaries_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
