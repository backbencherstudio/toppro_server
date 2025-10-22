/*
  Warnings:

  - You are about to alter the column `balance` on the `chart_of_accounts` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.

*/
-- AlterTable
ALTER TABLE "bank_accounts" ALTER COLUMN "opening_balance" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "chart_of_accounts" ALTER COLUMN "balance" SET DATA TYPE DOUBLE PRECISION;
