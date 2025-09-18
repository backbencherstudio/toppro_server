-- CreateTable
CREATE TABLE "ModulePrice" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "priceMonth" INTEGER NOT NULL,
    "priceYear" INTEGER NOT NULL,
    "logo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModulePrice_pkey" PRIMARY KEY ("id")
);
