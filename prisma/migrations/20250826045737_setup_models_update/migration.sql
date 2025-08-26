/*
  Warnings:

  - You are about to drop the column `deleted_at` on the `deal_stages` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `labels` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `lead_stages` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `pipelines` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `sources` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "deal_stages" DROP COLUMN "deleted_at";

-- AlterTable
ALTER TABLE "labels" DROP COLUMN "deleted_at";

-- AlterTable
ALTER TABLE "lead_stages" DROP COLUMN "deleted_at";

-- AlterTable
ALTER TABLE "pipelines" DROP COLUMN "deleted_at";

-- AlterTable
ALTER TABLE "sources" DROP COLUMN "deleted_at";
