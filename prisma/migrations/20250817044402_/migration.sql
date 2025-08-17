/*
  Warnings:

  - A unique constraint covering the columns `[owner_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "owner_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_owner_id_key" ON "users"("owner_id");
