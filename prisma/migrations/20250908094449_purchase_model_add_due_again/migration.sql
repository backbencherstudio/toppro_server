/*
  Warnings:

  - You are about to drop the column `issued_amount` on the `invoices` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "invoices" DROP COLUMN "issued_amount";
