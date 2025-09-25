-- AlterTable
ALTER TABLE "coupons" ADD COLUMN     "applicableTo" TEXT[],
ADD COLUMN     "basicPackage_id" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "lastUsedAt" TIMESTAMP(3),
ADD COLUMN     "startDate" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "_ComboPlanToCoupon" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ComboPlanToCoupon_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ComboPlanToCoupon_B_index" ON "_ComboPlanToCoupon"("B");

-- CreateIndex
CREATE INDEX "coupons_code_idx" ON "coupons"("code");

-- AddForeignKey
ALTER TABLE "coupons" ADD CONSTRAINT "coupons_basicPackage_id_fkey" FOREIGN KEY ("basicPackage_id") REFERENCES "BasicPackage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ComboPlanToCoupon" ADD CONSTRAINT "_ComboPlanToCoupon_A_fkey" FOREIGN KEY ("A") REFERENCES "combo_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ComboPlanToCoupon" ADD CONSTRAINT "_ComboPlanToCoupon_B_fkey" FOREIGN KEY ("B") REFERENCES "coupons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
