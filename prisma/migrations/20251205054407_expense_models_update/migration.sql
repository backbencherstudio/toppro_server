/*
  Warnings:

  - You are about to drop the column `amount` on the `bills` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `bills` table. All the data in the column will be lost.
  - The `status` column on the `bills` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `_BillToPurchase` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `subTotal` on table `bills` required. This step will fail if there are existing NULL values in that column.
  - Made the column `total` on table `bills` required. This step will fail if there are existing NULL values in that column.
  - Made the column `paid` on table `bills` required. This step will fail if there are existing NULL values in that column.
  - Made the column `due` on table `bills` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "_BillToPurchase" DROP CONSTRAINT "_BillToPurchase_A_fkey";

-- DropForeignKey
ALTER TABLE "_BillToPurchase" DROP CONSTRAINT "_BillToPurchase_B_fkey";

-- AlterTable
ALTER TABLE "bills" DROP COLUMN "amount",
DROP COLUMN "currency",
ADD COLUMN     "purchaseId" TEXT,
ALTER COLUMN "subTotal" SET NOT NULL,
ALTER COLUMN "total" SET NOT NULL,
ALTER COLUMN "paid" SET NOT NULL,
ALTER COLUMN "due" SET NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'DRAFT';

-- DropTable
DROP TABLE "_BillToPurchase";

-- AddForeignKey
ALTER TABLE "bills" ADD CONSTRAINT "bills_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "purchases"("id") ON DELETE SET NULL ON UPDATE CASCADE;
