-- CreateEnum
CREATE TYPE "DecimalFormat" AS ENUM ('NO_DECIMAL', 'ONE_DECIMAL', 'TWO_DECIMAL', 'THREE_DECIMAL', 'FOUR_DECIMAL');

-- CreateEnum
CREATE TYPE "SeparatorType" AS ENUM ('DOT', 'COMMA');

-- CreateEnum
CREATE TYPE "CurrencySymbolPosition" AS ENUM ('PRE', 'POST');

-- CreateEnum
CREATE TYPE "CurrencySymbolSpace" AS ENUM ('WITH_SPACE', 'WITHOUT_SPACE');

-- CreateEnum
CREATE TYPE "CurrencySymbolAndName" AS ENUM ('WITH_SYMBOL', 'WITH_NAME');

-- CreateTable
CREATE TABLE "currency_settings" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "decimal_format" "DecimalFormat" NOT NULL DEFAULT 'ONE_DECIMAL',
    "decimal_separator" "SeparatorType" NOT NULL DEFAULT 'DOT',
    "thousands_separator" "SeparatorType" NOT NULL DEFAULT 'COMMA',
    "float_number" "SeparatorType" NOT NULL DEFAULT 'COMMA',
    "currency_symbol_position" "CurrencySymbolPosition" NOT NULL DEFAULT 'PRE',
    "currency_symbol_space" "CurrencySymbolSpace" NOT NULL DEFAULT 'WITHOUT_SPACE',
    "currency_symbol_and_name" "CurrencySymbolAndName" NOT NULL DEFAULT 'WITH_SYMBOL',
    "default_currency" TEXT NOT NULL DEFAULT 'USD',
    "owner_id" TEXT,
    "workspace_id" TEXT,

    CONSTRAINT "currency_settings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "currency_settings" ADD CONSTRAINT "currency_settings_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "currency_settings" ADD CONSTRAINT "currency_settings_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
