/*
  Warnings:

  - You are about to drop the `_BankAccountToTransfer` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `from_type` on the `transfers` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `to_type` on the `transfers` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "_BankAccountToTransfer" DROP CONSTRAINT "_BankAccountToTransfer_A_fkey";

-- DropForeignKey
ALTER TABLE "_BankAccountToTransfer" DROP CONSTRAINT "_BankAccountToTransfer_B_fkey";

-- AlterTable
ALTER TABLE "transfers" DROP COLUMN "from_type",
ADD COLUMN     "from_type" "BankType" NOT NULL,
DROP COLUMN "to_type",
ADD COLUMN     "to_type" "BankType" NOT NULL;

-- DropTable
DROP TABLE "_BankAccountToTransfer";

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_from_account_fkey" FOREIGN KEY ("from_account") REFERENCES "bank_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_to_account_fkey" FOREIGN KEY ("to_account") REFERENCES "bank_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
