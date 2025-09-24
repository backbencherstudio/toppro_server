-- AlterTable
ALTER TABLE "ModulePrice" ADD COLUMN     "category" TEXT,
ADD COLUMN     "status" BOOLEAN NOT NULL DEFAULT true;
