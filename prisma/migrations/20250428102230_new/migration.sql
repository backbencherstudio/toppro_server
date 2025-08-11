-- CreateTable
CREATE TABLE "chat_log" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_log_pkey" PRIMARY KEY ("id")
);
