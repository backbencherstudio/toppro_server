-- CreateEnum
CREATE TYPE "PackageStatus" AS ENUM ('FREE', 'PREMIUM_MONTHLY', 'PREMIUM_YEARLY');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "package_status" "PackageStatus" NOT NULL DEFAULT 'FREE';
