/*
  Warnings:

  - You are about to drop the `_CategoryTickets` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_CategoryTickets" DROP CONSTRAINT "_CategoryTickets_A_fkey";

-- DropForeignKey
ALTER TABLE "_CategoryTickets" DROP CONSTRAINT "_CategoryTickets_B_fkey";

-- DropTable
DROP TABLE "_CategoryTickets";
