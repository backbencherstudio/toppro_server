/*
  Warnings:

  - You are about to drop the column `stage` on the `leads` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "leads" DROP COLUMN "stage";

-- DropEnum
DROP TYPE "LeadStageStatus";
