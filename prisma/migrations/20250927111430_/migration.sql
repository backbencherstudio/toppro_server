/*
  Warnings:

  - Added the required column `bank_type` to the `bank_accounts` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BankType" AS ENUM ('BANK', 'WALLET');

-- CreateEnum
CREATE TYPE "ParentAccountType" AS ENUM ('ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE');

-- CreateEnum
CREATE TYPE "ChildAccountType" AS ENUM ('CURRENT_ASSET', 'INVENTORY_ASSET', 'NON_CURRENT_ASSET', 'CURRENT_LIABILITIES', 'LONG_TERM_LIABILITIES', 'SHARE_CAPITAL', 'RETAINED_EARNINGS', 'OWNERS_EQUITY', 'SALES_REVENUE', 'OTHER_REVENUE', 'COST_OF_GOODS_SOLD', 'PAYROLL_EXPENSES', 'GENERAL_AND_ADMIN_EXPENSES');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Status" ADD VALUE 'ACTIVE';
ALTER TYPE "Status" ADD VALUE 'INACTIVE';

-- AlterTable
ALTER TABLE "bank_accounts" ADD COLUMN     "chart_of_account_id" TEXT,
DROP COLUMN "bank_type",
ADD COLUMN     "bank_type" "BankType" NOT NULL;

-- CreateTable
CREATE TABLE "chart_of_accounts" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "account_category" "ParentAccountType" NOT NULL,
    "parent_account_name" TEXT,
    "child_account_type" "ChildAccountType",
    "balance" DECIMAL(65,30) DEFAULT 0.0,
    "status" TEXT DEFAULT 'ACTIVE',
    "user_id" TEXT,
    "workspace_id" TEXT,
    "owner_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(6),

    CONSTRAINT "chart_of_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "chart_of_accounts_code_key" ON "chart_of_accounts"("code");

-- AddForeignKey
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_chart_of_account_id_fkey" FOREIGN KEY ("chart_of_account_id") REFERENCES "chart_of_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chart_of_accounts" ADD CONSTRAINT "chart_of_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chart_of_accounts" ADD CONSTRAINT "chart_of_accounts_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;
