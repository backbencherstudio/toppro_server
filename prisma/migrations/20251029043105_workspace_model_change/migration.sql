-- DropIndex
DROP INDEX "workspaces_code_key";

-- AlterTable
ALTER TABLE "workspaces" ALTER COLUMN "code" DROP NOT NULL,
ALTER COLUMN "owner_id" DROP NOT NULL;
