/*
  Warnings:

  - You are about to drop the column `owner_id` on the `email_texts` table. All the data in the column will be lost.
  - You are about to drop the column `workspace_id` on the `email_texts` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "email_texts" DROP CONSTRAINT "email_texts_owner_id_fkey";

-- DropForeignKey
ALTER TABLE "email_texts" DROP CONSTRAINT "email_texts_workspace_id_fkey";

-- DropIndex
DROP INDEX "email_texts_workspace_id_owner_id_idx";

-- AlterTable
ALTER TABLE "email_texts" DROP COLUMN "owner_id",
DROP COLUMN "workspace_id";
