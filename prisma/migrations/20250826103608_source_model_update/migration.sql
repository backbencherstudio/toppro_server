/*
  Warnings:

  - You are about to drop the column `pipelineId` on the `sources` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "sources" DROP CONSTRAINT "sources_pipelineId_fkey";

-- DropIndex
DROP INDEX "sources_pipelineId_idx";

-- AlterTable
ALTER TABLE "sources" DROP COLUMN "pipelineId";
