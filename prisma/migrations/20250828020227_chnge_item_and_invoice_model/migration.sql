/*
  Warnings:

  - You are about to drop the column `items_id` on the `Vendor` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `Vendor` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Vendor" DROP CONSTRAINT "Vendor_user_id_fkey";

-- DropIndex
DROP INDEX "users_owner_id_key";

-- DropIndex
DROP INDEX "users_super_id_key";

-- AlterTable
ALTER TABLE "Vendor" DROP COLUMN "items_id",
DROP COLUMN "user_id";
