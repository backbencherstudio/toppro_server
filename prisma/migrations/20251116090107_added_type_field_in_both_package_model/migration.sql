-- AlterTable
ALTER TABLE "BasicPackage" ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'basic';

-- AlterTable
ALTER TABLE "combo_plans" ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'combo';
