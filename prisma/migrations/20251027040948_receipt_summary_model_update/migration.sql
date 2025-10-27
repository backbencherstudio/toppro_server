-- AlterTable
ALTER TABLE "receipt_summaries" ALTER COLUMN "owner_id" DROP NOT NULL,
ALTER COLUMN "user_id" DROP NOT NULL,
ALTER COLUMN "workspace_id" DROP NOT NULL;
