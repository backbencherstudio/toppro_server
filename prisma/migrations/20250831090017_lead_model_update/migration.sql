/*
  Warnings:

  - Made the column `email` on table `leads` required. This step will fail if there are existing NULL values in that column.
  - Made the column `phone` on table `leads` required. This step will fail if there are existing NULL values in that column.
  - Made the column `followup_at` on table `leads` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "leads" DROP CONSTRAINT "leads_pipeline_id_fkey";

-- DropIndex
DROP INDEX "Unit_name_key";

-- AlterTable
ALTER TABLE "leads" ALTER COLUMN "updated_at" DROP DEFAULT,
ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "phone" SET NOT NULL,
ALTER COLUMN "followup_at" SET NOT NULL,
ALTER COLUMN "pipeline_id" DROP NOT NULL,
ALTER COLUMN "pipeline_name" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_pipeline_id_fkey" FOREIGN KEY ("pipeline_id") REFERENCES "pipelines"("id") ON DELETE SET NULL ON UPDATE CASCADE;
