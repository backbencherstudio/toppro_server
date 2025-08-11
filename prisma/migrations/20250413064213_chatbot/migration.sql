/*
  Warnings:

  - You are about to drop the `chatbot` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "chatbot";

-- CreateTable
CREATE TABLE "chat_log" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_log_pkey" PRIMARY KEY ("id")
);
