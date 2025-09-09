/*
  Warnings:

  - You are about to drop the column `deleted_at` on the `attachments` table. All the data in the column will be lost.
  - You are about to drop the column `file` on the `attachments` table. All the data in the column will be lost.
  - You are about to drop the column `file_alt` on the `attachments` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `attachments` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `attachments` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `attachments` table. All the data in the column will be lost.
  - You are about to drop the `messages` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `file_name` to the `attachments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `file_size` to the `attachments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `file_url` to the `attachments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lead_id` to the `attachments` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_attachment_id_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_conversation_id_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_receiver_id_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_sender_id_fkey";

-- AlterTable
ALTER TABLE "attachments" DROP COLUMN "deleted_at",
DROP COLUMN "file",
DROP COLUMN "file_alt",
DROP COLUMN "name",
DROP COLUMN "size",
DROP COLUMN "type",
ADD COLUMN     "file_name" TEXT NOT NULL,
ADD COLUMN     "file_size" INTEGER NOT NULL,
ADD COLUMN     "file_url" TEXT NOT NULL,
ADD COLUMN     "lead_id" TEXT NOT NULL,
ALTER COLUMN "updated_at" DROP DEFAULT;

-- DropTable
DROP TABLE "messages";

-- CreateIndex
CREATE INDEX "attachments_lead_id_idx" ON "attachments"("lead_id");

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
