/*
  Warnings:

  - You are about to drop the column `tilte_text` on the `controller_settings` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `controller_settings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "controller_settings" DROP COLUMN "tilte_text",
DROP COLUMN "user_id",
ADD COLUMN     "title_text" TEXT;
