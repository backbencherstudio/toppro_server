-- AlterTable
ALTER TABLE "payment_transactions" ADD COLUMN     "receiver_id" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "balance" DECIMAL(65,30) DEFAULT 0;

-- AddForeignKey
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
