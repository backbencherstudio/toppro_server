-- CreateTable
CREATE TABLE "messanger" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sender" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messanger_pkey" PRIMARY KEY ("id")
);
