/*
  Warnings:

  - You are about to drop the `ServiceOrder` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ServicePricing` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ServiceOrder" DROP CONSTRAINT "ServiceOrder_userId_fkey";

-- DropTable
DROP TABLE "ServiceOrder";

-- DropTable
DROP TABLE "ServicePricing";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "chatbot" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chatbot_pkey" PRIMARY KEY ("id")
);
