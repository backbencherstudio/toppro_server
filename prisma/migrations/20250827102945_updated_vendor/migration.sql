/*
  Warnings:

  - A unique constraint covering the columns `[super_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[owner_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `items_id` to the `Vendor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `Vendor` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Vendor" DROP CONSTRAINT "Vendor_owner_id_fkey";

-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN     "items_id" TEXT NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_super_id_key" ON "users"("super_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_owner_id_key" ON "users"("owner_id");

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("owner_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
