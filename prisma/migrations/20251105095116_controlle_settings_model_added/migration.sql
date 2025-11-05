-- CreateTable
CREATE TABLE "controller_settings" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "owner_id" TEXT,
    "super_id" TEXT,
    "user_id" TEXT,
    "logo_dark" TEXT,
    "logo_light" TEXT,
    "logo_favicon" TEXT,
    "tilte_text" TEXT,
    "footer_text" TEXT,
    "customer_prefix" TEXT,
    "vendor_prefix" TEXT,

    CONSTRAINT "controller_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ControllerSettingsToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ControllerSettingsToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ControllerSettingsToUser_B_index" ON "_ControllerSettingsToUser"("B");

-- AddForeignKey
ALTER TABLE "_ControllerSettingsToUser" ADD CONSTRAINT "_ControllerSettingsToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "controller_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ControllerSettingsToUser" ADD CONSTRAINT "_ControllerSettingsToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
