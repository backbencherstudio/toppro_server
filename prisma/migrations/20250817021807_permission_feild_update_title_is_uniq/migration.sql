/*
  Warnings:

  - A unique constraint covering the columns `[title]` on the table `permissions` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "permissions" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "roles" ADD COLUMN     "description" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "permissions_title_key" ON "permissions"("title");
