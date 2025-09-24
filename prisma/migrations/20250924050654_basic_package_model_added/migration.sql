-- CreateTable
CREATE TABLE "BasicPackage" (
    "id" TEXT NOT NULL,
    "monthlyBasicPrice" INTEGER NOT NULL,
    "monthlyPricePerUser" INTEGER NOT NULL,
    "monthlyPricePerWorkspace" INTEGER NOT NULL,
    "yearlyBasicPrice" INTEGER NOT NULL,
    "yearlyPricePerUser" INTEGER NOT NULL,
    "yearlyPricePerWorkspace" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BasicPackage_pkey" PRIMARY KEY ("id")
);
