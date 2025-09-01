/*
  Warnings:

  - You are about to drop the column `owner_id` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `workspace_id` on the `tasks` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_owner_id_fkey";

-- DropForeignKey
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_workspace_id_fkey";

-- DropIndex
DROP INDEX "tasks_workspace_id_owner_id_idx";

-- AlterTable
ALTER TABLE "tasks" DROP COLUMN "owner_id",
DROP COLUMN "workspace_id";
