/*
  Warnings:

  - You are about to drop the column `actor_id` on the `activities` table. All the data in the column will be lost.
  - You are about to drop the column `meta` on the `activities` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "activities" DROP CONSTRAINT "activities_actor_id_fkey";

-- AlterTable
ALTER TABLE "activities" DROP COLUMN "actor_id",
DROP COLUMN "meta";
