-- CreateTable
CREATE TABLE "company_settings" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "company_name" TEXT,
    "company_registration_number" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "zip_code" TEXT,
    "telephone" TEXT,
    "email_from_name" TEXT,
    "system_email" TEXT,
    "tax_number_enabled" BOOLEAN NOT NULL DEFAULT false,
    "tax_number_type" TEXT,
    "tax_number_value" TEXT,
    "owner_id" TEXT,
    "workspace_id" TEXT,

    CONSTRAINT "company_settings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "company_settings" ADD CONSTRAINT "company_settings_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_settings" ADD CONSTRAINT "company_settings_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
