-- AlterTable
ALTER TABLE "user_subscriptions" ADD COLUMN     "Accounting_for_addons" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "Crm_for_addons" BOOLEAN NOT NULL DEFAULT false;
