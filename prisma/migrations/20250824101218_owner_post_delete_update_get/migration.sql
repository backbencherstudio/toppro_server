/*
  Warnings:

  - You are about to drop the column `approved_at` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `availability` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `domain` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `_UserToWorkspace` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_UserToWorkspace" DROP CONSTRAINT "_UserToWorkspace_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserToWorkspace" DROP CONSTRAINT "_UserToWorkspace_B_fkey";

-- DropIndex
DROP INDEX "users_domain_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "approved_at",
DROP COLUMN "availability",
DROP COLUMN "domain";

-- DropTable
DROP TABLE "_UserToWorkspace";

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;
