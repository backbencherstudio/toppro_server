-- CreateTable
CREATE TABLE "log_time" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "description" TEXT,
    "date" TIMESTAMP(3),
    "user_id" TEXT,
    "workspace_id" TEXT,
    "owner_id" TEXT,
    "item_id" TEXT,

    CONSTRAINT "log_time_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "log_time" ADD CONSTRAINT "log_time_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_time" ADD CONSTRAINT "log_time_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_time" ADD CONSTRAINT "log_time_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE SET NULL ON UPDATE CASCADE;
