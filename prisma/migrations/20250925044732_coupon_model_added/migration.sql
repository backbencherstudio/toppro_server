/*
  Warnings:

  - You are about to drop the column `category` on the `ModulePrice` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `ModulePrice` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "CouponType" AS ENUM ('Percentage', 'Flat');

-- AlterTable
ALTER TABLE "ModulePrice" DROP COLUMN "category",
DROP COLUMN "status";

-- CreateTable
CREATE TABLE "coupons" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "CouponType" NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL,
    "minimumSpend" DOUBLE PRECISION,
    "maximumSpend" DOUBLE PRECISION,
    "usageLimit" INTEGER,
    "usagePerUser" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "expiryDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "owner_id" TEXT NOT NULL,

    CONSTRAINT "coupons_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "coupons_code_key" ON "coupons"("code");

-- CreateIndex
CREATE INDEX "coupons_owner_id_idx" ON "coupons"("owner_id");

-- AddForeignKey
ALTER TABLE "coupons" ADD CONSTRAINT "coupons_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
