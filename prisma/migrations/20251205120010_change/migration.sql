-- AlterTable
ALTER TABLE "debit_notes" ADD COLUMN     "category_id" TEXT;

-- AddForeignKey
ALTER TABLE "debit_notes" ADD CONSTRAINT "debit_notes_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "ItemCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
