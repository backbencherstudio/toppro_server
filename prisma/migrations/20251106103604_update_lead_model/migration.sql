-- CreateEnum
CREATE TYPE "LeadStageStatus" AS ENUM ('DRAFT', 'SENT');

-- AlterTable
ALTER TABLE "leads" ADD COLUMN     "stage" "LeadStageStatus" NOT NULL DEFAULT 'DRAFT';
