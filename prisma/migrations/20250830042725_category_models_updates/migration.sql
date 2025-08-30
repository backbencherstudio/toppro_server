/*
  Warnings:

  - You are about to drop the column `user_id` on the `AccountType` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `BillCategory` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `InvoiceCategory` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `ItemCategory` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `ItemType` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `Tax` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `Unit` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "AccountType" DROP CONSTRAINT "AccountType_user_id_fkey";

-- DropForeignKey
ALTER TABLE "BillCategory" DROP CONSTRAINT "BillCategory_user_id_fkey";

-- DropForeignKey
ALTER TABLE "InvoiceCategory" DROP CONSTRAINT "InvoiceCategory_user_id_fkey";

-- DropForeignKey
ALTER TABLE "ItemCategory" DROP CONSTRAINT "ItemCategory_user_id_fkey";

-- DropForeignKey
ALTER TABLE "ItemType" DROP CONSTRAINT "ItemType_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Tax" DROP CONSTRAINT "Tax_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Unit" DROP CONSTRAINT "Unit_user_id_fkey";

-- AlterTable
ALTER TABLE "AccountType" DROP COLUMN "user_id";

-- AlterTable
ALTER TABLE "BillCategory" DROP COLUMN "user_id";

-- AlterTable
ALTER TABLE "InvoiceCategory" DROP COLUMN "user_id";

-- AlterTable
ALTER TABLE "ItemCategory" DROP COLUMN "user_id";

-- AlterTable
ALTER TABLE "ItemType" DROP COLUMN "user_id";

-- AlterTable
ALTER TABLE "Tax" DROP COLUMN "user_id";

-- AlterTable
ALTER TABLE "Unit" DROP COLUMN "user_id";
