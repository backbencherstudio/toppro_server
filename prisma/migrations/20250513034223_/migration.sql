/*
  Warnings:

  - You are about to drop the `messanger` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "roles" ALTER COLUMN "title" SET DEFAULT 'user',
ALTER COLUMN "name" SET DEFAULT 'user';

-- DropTable
DROP TABLE "messanger";

-- CreateTable
CREATE TABLE "withdrawal_settings" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "status" SMALLINT DEFAULT 1,
    "minimum_withdrawal_amount" DOUBLE PRECISION NOT NULL,
    "withdrawal_processing_fee" DOUBLE PRECISION NOT NULL,
    "withdrawal_processing_time" TEXT NOT NULL,
    "is_flat_commission" BOOLEAN NOT NULL,
    "flat_commission_value" DOUBLE PRECISION,
    "percentage_commission_value" DOUBLE PRECISION,
    "payment_methods" TEXT[],

    CONSTRAINT "withdrawal_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "security_settings" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "status" SMALLINT DEFAULT 1,
    "data_export_backup" INTEGER NOT NULL,
    "session_timeout" INTEGER NOT NULL,
    "failed_login_attempts" INTEGER NOT NULL,
    "password_expiry" INTEGER NOT NULL,

    CONSTRAINT "security_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_histories" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "status" SMALLINT DEFAULT 1,
    "sort_order" INTEGER DEFAULT 0,
    "type" TEXT,
    "subject" TEXT,
    "body" TEXT,

    CONSTRAINT "email_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_history_recipients" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "email_history_id" TEXT NOT NULL,
    "recipient_id" TEXT NOT NULL,

    CONSTRAINT "email_history_recipients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_performances" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "post_id" TEXT NOT NULL,
    "platform" TEXT,
    "likes" INTEGER,
    "comments" INTEGER,
    "shares" INTEGER,
    "reach" INTEGER,
    "impressions" INTEGER,
    "clicks" INTEGER,
    "engagement_rate" DOUBLE PRECISION,

    CONSTRAINT "post_performances_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "email_history_recipients" ADD CONSTRAINT "email_history_recipients_email_history_id_fkey" FOREIGN KEY ("email_history_id") REFERENCES "email_histories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_history_recipients" ADD CONSTRAINT "email_history_recipients_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_performances" ADD CONSTRAINT "post_performances_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
