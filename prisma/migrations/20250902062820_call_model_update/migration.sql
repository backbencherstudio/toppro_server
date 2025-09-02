/*
  Warnings:

  - You are about to drop the column `owner_id` on the `calls` table. All the data in the column will be lost.
  - You are about to drop the column `workspace_id` on the `calls` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "calls" DROP CONSTRAINT "calls_owner_id_fkey";

-- DropForeignKey
ALTER TABLE "calls" DROP CONSTRAINT "calls_workspace_id_fkey";

-- DropIndex
DROP INDEX "calls_workspace_id_owner_id_idx";

-- AlterTable
ALTER TABLE "calls" DROP COLUMN "owner_id",
DROP COLUMN "workspace_id";
