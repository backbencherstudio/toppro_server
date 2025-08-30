/*
  Warnings:

  - You are about to drop the column `user_id` on the `Vendor` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Vendor" DROP CONSTRAINT "Vendor_user_id_fkey";

-- AlterTable
ALTER TABLE "Vendor" DROP COLUMN "user_id";
