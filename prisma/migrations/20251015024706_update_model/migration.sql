-- DropForeignKey
ALTER TABLE "Customer" DROP CONSTRAINT "Customer_owner_id_fkey";

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "customer_no" TEXT,
ADD COLUMN     "user_id" TEXT,
ALTER COLUMN "owner_id" DROP NOT NULL,
ALTER COLUMN "workspace_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
