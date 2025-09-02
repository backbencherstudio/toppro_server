/*
  Warnings:

  - The primary key for the `role_users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `updated_at` on the `role_users` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `roles` table. All the data in the column will be lost.
  - You are about to drop the `_RoleToUser` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[role_id,user_id]` on the table `role_users` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `role_users` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "_RoleToUser" DROP CONSTRAINT "_RoleToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_RoleToUser" DROP CONSTRAINT "_RoleToUser_B_fkey";

-- AlterTable
ALTER TABLE "role_users" DROP CONSTRAINT "role_users_pkey",
DROP COLUMN "updated_at",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "role_users_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "roles" DROP COLUMN "user_id",
ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "roleId" TEXT;

-- DropTable
DROP TABLE "_RoleToUser";

-- CreateTable
CREATE TABLE "_UsersOnRoles" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UsersOnRoles_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_UsersOnRoles_B_index" ON "_UsersOnRoles"("B");

-- CreateIndex
CREATE UNIQUE INDEX "role_users_role_id_user_id_key" ON "role_users"("role_id", "user_id");

-- AddForeignKey
ALTER TABLE "_UsersOnRoles" ADD CONSTRAINT "_UsersOnRoles_A_fkey" FOREIGN KEY ("A") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UsersOnRoles" ADD CONSTRAINT "_UsersOnRoles_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
