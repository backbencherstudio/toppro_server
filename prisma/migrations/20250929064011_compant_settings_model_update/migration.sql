/*
  Warnings:

  - The `tax_number_type` column on the `company_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `bank_type` on table `bank_accounts` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "TaxNumberType" AS ENUM ('VAT', 'GST');

-- AlterTable
ALTER TABLE "bank_accounts" ALTER COLUMN "bank_type" SET NOT NULL;

-- AlterTable
ALTER TABLE "company_settings" DROP COLUMN "tax_number_type",
ADD COLUMN     "tax_number_type" "TaxNumberType";
