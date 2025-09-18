-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('Paid', 'Free');

-- CreateTable
CREATE TABLE "combo_plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "planType" "PlanType" NOT NULL,
    "numberOfUsers" INTEGER NOT NULL,
    "numberOfWorkspaces" INTEGER NOT NULL,
    "pricePerMonth" INTEGER NOT NULL,
    "pricePerYear" INTEGER NOT NULL,
    "trialEnabled" BOOLEAN NOT NULL DEFAULT false,
    "trialDays" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "combo_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ComboPlanToModulePrice" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ComboPlanToModulePrice_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ComboPlanToModulePrice_B_index" ON "_ComboPlanToModulePrice"("B");

-- AddForeignKey
ALTER TABLE "_ComboPlanToModulePrice" ADD CONSTRAINT "_ComboPlanToModulePrice_A_fkey" FOREIGN KEY ("A") REFERENCES "combo_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ComboPlanToModulePrice" ADD CONSTRAINT "_ComboPlanToModulePrice_B_fkey" FOREIGN KEY ("B") REFERENCES "ModulePrice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
